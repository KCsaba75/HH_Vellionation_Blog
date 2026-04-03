
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

const splitIntoChunks = (text, maxLen = 200) => {
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > maxLen && current.length > 0) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
};

const ArticleAudioPlayer = ({ content, title }) => {
  const [isSupported, setIsSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voices, setVoices] = useState([]);

  const chunksRef = useRef([]);
  const chunkIndexRef = useRef(0);
  const keepAliveRef = useRef(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      stopSpeech();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    stopSpeech();
  }, [content]);

  const pickVoice = useCallback((voiceList) => {
    return (
      voiceList.find(v => v.lang.startsWith('en') && (
        v.name.includes('Google') ||
        v.name.includes('Neural') ||
        v.name.includes('Natural') ||
        v.name.includes('Samantha')
      )) ||
      voiceList.find(v => v.lang.startsWith('en')) ||
      voiceList[0] ||
      null
    );
  }, []);

  const stopSpeech = useCallback(() => {
    stoppedRef.current = true;
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    chunkIndexRef.current = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  }, []);

  const speakChunk = useCallback((chunks, index, voiceList) => {
    if (stoppedRef.current || index >= chunks.length) {
      if (!stoppedRef.current) {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    const preferred = pickVoice(voiceList);
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      const pct = Math.round((index / chunks.length) * 100);
      setProgress(pct);
    };

    utterance.onend = () => {
      if (stoppedRef.current) return;
      chunkIndexRef.current = index + 1;
      const pct = Math.round(((index + 1) / chunks.length) * 100);
      setProgress(pct);
      setTimeout(() => speakChunk(chunks, index + 1, voiceList), 60);
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [pickVoice]);

  const startSpeech = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    stoppedRef.current = false;
    window.speechSynthesis.cancel();

    const fullText = (title ? title + '. ' : '') + stripHtml(content);
    const chunks = splitIntoChunks(fullText, 200);
    chunksRef.current = chunks;
    chunkIndexRef.current = 0;

    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();

    setIsPlaying(true);
    setIsPaused(false);
    setProgress(0);

    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    keepAliveRef.current = setInterval(() => {
      if (
        'speechSynthesis' in window &&
        !stoppedRef.current &&
        window.speechSynthesis.speaking &&
        !window.speechSynthesis.paused
      ) {
        window.speechSynthesis.resume();
      }
    }, 14000);

    setTimeout(() => speakChunk(chunks, 0, currentVoices), 80);
  }, [content, title, voices, speakChunk]);

  const handlePlay = () => {
    if (isPaused) {
      stoppedRef.current = false;
      window.speechSynthesis.resume();
      if (!window.speechSynthesis.speaking) {
        const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        speakChunk(chunksRef.current, chunkIndexRef.current, currentVoices);
      }
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      startSpeech();
    }
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    stopSpeech();
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-muted/40 border rounded-xl px-4 py-3 mb-8">
      <Volume2 className="h-5 w-5 text-primary flex-shrink-0" />
      <span className="text-sm font-medium text-muted-foreground hidden sm:block">Listen to article</span>
      <div className="flex items-center gap-2">
        {isPlaying ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handlePause}
            aria-label="Pause reading"
            className="h-8 w-8 p-0 rounded-full"
          >
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handlePlay}
            aria-label={isPaused ? 'Resume reading' : 'Start reading'}
            className="h-8 w-8 p-0 rounded-full"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
        {(isPlaying || isPaused || progress > 0) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleStop}
            aria-label="Stop reading"
            className="h-8 w-8 p-0 rounded-full"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-grow">
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">
        {progress > 0 ? `${progress}%` : ''}
      </span>
    </div>
  );
};

export default ArticleAudioPlayer;
