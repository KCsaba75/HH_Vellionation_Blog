import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const CookieConsentContext = createContext();

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return context;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

const getMidnightExpiry = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight;
};

const setMidnightCookie = (name, value) => {
  const midnight = getMidnightExpiry();
  document.cookie = `${name}=${value};expires=${midnight.toUTCString()};path=/;SameSite=Lax`;
};

const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};

export const CookieConsentProvider = ({ children }) => {
  const [hasConsent, setHasConsent] = useState(null);
  const [articleReadToday, setArticleReadToday] = useState(false);
  const [readArticleSlug, setReadArticleSlug] = useState(null);
  const [showConsentPopup, setShowConsentPopup] = useState(false);
  const midnightTimerRef = useRef(null);

  const syncArticleState = useCallback(() => {
    const articleRead = getCookie('vellio_article_read');
    const articleSlug = getCookie('vellio_article_slug');
    
    if (articleRead === 'true') {
      setArticleReadToday(true);
      setReadArticleSlug(articleSlug);
    } else {
      setArticleReadToday(false);
      setReadArticleSlug(null);
    }
  }, []);

  useEffect(() => {
    const consent = getCookie('vellio_consent');
    
    if (consent === 'accepted') {
      setHasConsent(true);
    } else if (consent === 'declined') {
      setHasConsent(false);
    } else {
      setShowConsentPopup(true);
    }

    syncArticleState();
    
    const scheduleMidnightReset = () => {
      if (midnightTimerRef.current) {
        clearTimeout(midnightTimerRef.current);
      }
      
      const timeUntilMidnight = getTimeUntilMidnight();
      midnightTimerRef.current = setTimeout(() => {
        syncArticleState();
        scheduleMidnightReset();
      }, timeUntilMidnight + 1000);
    };
    
    scheduleMidnightReset();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncArticleState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (midnightTimerRef.current) {
        clearTimeout(midnightTimerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncArticleState]);

  const acceptConsent = useCallback(() => {
    setCookie('vellio_consent', 'accepted', 365);
    setHasConsent(true);
    setShowConsentPopup(false);
  }, []);

  const declineConsent = useCallback(() => {
    setCookie('vellio_consent', 'declined', 365);
    setHasConsent(false);
    setShowConsentPopup(false);
    deleteCookie('vellio-theme');
  }, []);

  const markArticleRead = useCallback((slug) => {
    setMidnightCookie('vellio_article_read', 'true');
    setMidnightCookie('vellio_article_slug', slug);
    setArticleReadToday(true);
    setReadArticleSlug(slug);
  }, []);

  const canReadArticle = useCallback((slug) => {
    if (!articleReadToday) return true;
    if (readArticleSlug === slug) return true;
    return false;
  }, [articleReadToday, readArticleSlug]);

  const value = {
    hasConsent,
    showConsentPopup,
    setShowConsentPopup,
    acceptConsent,
    declineConsent,
    articleReadToday,
    readArticleSlug,
    markArticleRead,
    canReadArticle,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};
