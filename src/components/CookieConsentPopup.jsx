import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Button } from '@/components/ui/button';
import { Cookie, Shield, FileText, User } from 'lucide-react';

const CookieConsentPopup = () => {
  const { showConsentPopup, acceptConsent, declineConsent } = useCookieConsent();

  return (
    <AnimatePresence>
      {showConsentPopup && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Welcome to Vellio Nation</h2>
                    <p className="text-sm text-muted-foreground">Your wellness journey starts here</p>
                  </div>
                </div>
                
                <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                  Your experience matters to us! We use cookies to personalize your visit and ensure our site works seamlessly for you. Your privacy and comfort are our top priorities.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm">Theme Preferences</h3>
                      <p className="text-xs text-muted-foreground">
                        By accepting, we'll save your light/dark mode preference so the site looks the way you like it every time you visit.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm">Affiliate Disclosure</h3>
                      <p className="text-xs text-muted-foreground">
                        Some articles contain affiliate links. When you purchase through these links, we may earn a small commission at no extra cost to you. This helps us maintain and improve our content.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <User className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm text-amber-700 dark:text-amber-300">Guest Reading Limit</h3>
                      <p className="text-xs text-muted-foreground">
                        As a guest, you can read <strong>1 article per day</strong>. Create a free account to enjoy unlimited access to all our content!
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  By clicking "Accept All", you agree to our use of cookies for storing your preferences and acknowledge our affiliate disclosure policy. You can change your preferences at any time.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={acceptConsent} 
                    className="flex-1 gap-2"
                  >
                    <Cookie className="w-4 h-4" />
                    Accept All
                  </Button>
                  <Button 
                    onClick={declineConsent} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Essential Only
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  View our{' '}
                  <a href="/privacy-policy" className="underline hover:text-primary">
                    Privacy Policy
                  </a>
                  {' '}and{' '}
                  <a href="/terms-of-service" className="underline hover:text-primary">
                    Terms of Service
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentPopup;
