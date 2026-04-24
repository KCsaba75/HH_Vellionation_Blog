import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Button } from '@/components/ui/button';
import { Cookie, Shield, FileText, User } from 'lucide-react';

const CookieConsentPopup = () => {
  const { showConsentPopup, acceptConsent, declineConsent } = useCookieConsent();
  const popupRef = useRef(null);
  const acceptBtnRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!showConsentPopup) return;

    previouslyFocusedRef.current = document.activeElement;

    const focusTimer = setTimeout(() => {
      acceptBtnRef.current?.focus();
    }, 50);

    const getFocusables = () => {
      if (!popupRef.current) return [];
      return Array.from(
        popupRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        declineConsent();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !popupRef.current?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !popupRef.current?.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showConsentPopup, declineConsent]);

  const restorePreviousFocus = () => {
    if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  };

  return (
    <AnimatePresence onExitComplete={restorePreviousFocus}>
      {showConsentPopup && (
        <motion.div
          ref={popupRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          initial={{ opacity: 0, x: 80, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 80, y: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-sm mx-auto sm:mx-0 left-4 sm:left-auto"
        >
          <div className="bg-card border shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 id="cookie-consent-title" className="text-base font-bold leading-tight">Welcome to Vellio Nation</h2>
                  <p className="text-xs text-muted-foreground">Your wellness journey starts here</p>
                </div>
              </div>

              <div id="cookie-consent-desc" className="space-y-2 mb-4">
                <div className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-xs">Theme Preferences</h3>
                    <p className="text-xs text-muted-foreground leading-snug">
                      We save your light/dark mode preference for future visits.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-xs">Affiliate Disclosure</h3>
                    <p className="text-xs text-muted-foreground leading-snug">
                      Some articles contain affiliate links. We may earn a small commission at no extra cost to you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <User className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-xs text-amber-700 dark:text-amber-300">Guest Reading Limit</h3>
                    <p className="text-xs text-muted-foreground leading-snug">
                      As a guest, you can read <strong>1 article per day</strong>. Create a free account for unlimited access!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button ref={acceptBtnRef} onClick={acceptConsent} size="sm" className="flex-1 gap-1.5 text-xs h-8">
                  <Cookie className="w-3.5 h-3.5" />
                  Accept All
                </Button>
                <Button onClick={declineConsent} variant="outline" size="sm" className="flex-1 text-xs h-8">
                  Essential Only
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-3">
                <a href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</a>
                {' '}and{' '}
                <a href="/terms-of-service" className="underline hover:text-primary">Terms of Service</a>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentPopup;
