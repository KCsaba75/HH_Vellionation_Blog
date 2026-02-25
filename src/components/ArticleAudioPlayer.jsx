
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

const ArticleAudioPlayer = ({ content, title }) => {
  const [isSupported, setIsSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef(null);
  const textRef = useRef('');
  const charIndexRef = useRef(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
    return () => {
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    stopSpeech();
  }, [content]);

  const stopSpeech = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    charIndexRef.current = 0;
  }, []);

  const startSpeech = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const fullText = (title ? title + '. ' : '') + stripHtml(content);
    textRef.current = fullText;
    charIndexRef.current = 0;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang === 'en-US' && (
        v.name.includes('Google') ||
        v.name.includes('Neural') ||
        v.name.includes('Natural') ||
        v.name.includes('Samantha')
      )
    ) || voices.find(v => v.lang === 'en-US');
    if (preferred) utterance.voice = preferred;

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        charIndexRef.current = e.charIndex;
        const pct = Math.min(100, Math.round((e.charIndex / fullText.length) * 100));
        setProgress(pct);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }, [content, title]);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
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
