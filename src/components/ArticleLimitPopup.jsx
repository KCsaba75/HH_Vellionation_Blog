import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus, LogIn, X } from 'lucide-react';

const ArticleLimitPopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 sm:p-8">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Daily Reading Limit Reached</h2>
                  <p className="text-muted-foreground">
                    You've read your free article for today. Create an account to continue reading unlimited articles!
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Unlimited access to all articles</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Save your favorite articles</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Join our wellness community</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Earn points and badges</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={handleRegister} className="w-full gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Free Account
                  </Button>
                  <Button onClick={handleLogin} variant="outline" className="w-full gap-2">
                    <LogIn className="w-4 h-4" />
                    I Already Have an Account
                  </Button>
                  <Button onClick={onClose} variant="ghost" className="w-full">
                    Maybe Later
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Your daily limit resets at midnight. Come back tomorrow for another free article!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ArticleLimitPopup;
