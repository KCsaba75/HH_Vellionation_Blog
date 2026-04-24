import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.705A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.963L3.964 7.295C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);


const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp, signInWithOAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    emailNotifications: true,
    newsletterSubscribed: true,
  });
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure your passwords match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.name, formData.emailNotifications, formData.newsletterSubscribed);
    if (!error) {
      toast({ title: "Welcome to Vellio Nation!", description: "Please check your email to confirm your account." });
      navigate('/');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    await signInWithOAuth(provider);
    setOauthLoading(null);
  };

  return (
    <>
      <Helmet>
        <title>Join Vellio Nation</title>
        <meta name="description" content="Create your Vellio Nation account and start your wellness journey today." />
        <meta property="og:title" content="Join Vellio Nation" />
        <meta property="og:description" content="Create your Vellio Nation account and start your wellness journey today." />
        <meta property="og:image" content="https://rtklsdtadtqpgoibulux.supabase.co/storage/v1/object/public/site_images/og-image.jpg" />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-8 rounded-xl shadow-lg"
          >
            <h1 className="text-3xl font-bold mb-6 text-center">Join Vellio Nation</h1>

            <div className="space-y-3 mb-5">
              <button
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-60"
              >
                <GoogleIcon />
                {oauthLoading === 'google' ? 'Redirecting...' : 'Continue with Google'}
              </button>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border mb-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email preferences</p>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary cursor-pointer"
                />
                <span className="text-sm leading-snug">
                  <span className="font-medium">Blog notifications</span>
                  <span className="block text-muted-foreground text-xs mt-0.5">Get an email when a new article is published.</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.newsletterSubscribed}
                  onChange={(e) => setFormData({ ...formData, newsletterSubscribed: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary cursor-pointer"
                />
                <span className="text-sm leading-snug">
                  <span className="font-medium">Vellio Nation newsletter</span>
                  <span className="block text-muted-foreground text-xs mt-0.5">Updates, community news, new solutions and wellness tips.</span>
                </span>
              </label>

              <p className="text-xs text-muted-foreground pt-1 border-t border-border/60">
                These preferences apply to all registration methods. You can change them anytime on your profile page.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowEmailForm((v) => !v)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Register with email</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showEmailForm ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence initial={false}>
              {showEmailForm && (
                <motion.div
                  key="email-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="pt-4 border-t border-border mt-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="register-name" className="block text-sm font-medium mb-2">Name</label>
                        <input
                          id="register-name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-3 rounded-lg border bg-background"
                          autoComplete="name"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="register-email" className="block text-sm font-medium mb-2">Email</label>
                        <input
                          id="register-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full p-3 rounded-lg border bg-background"
                          autoComplete="email"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="register-password" className="block text-sm font-medium mb-2">Password</label>
                        <input
                          id="register-password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full p-3 rounded-lg border bg-background"
                          autoComplete="new-password"
                          required
                          minLength="6"
                        />
                      </div>

                      <div>
                        <label htmlFor="register-confirm-password" className="block text-sm font-medium mb-2">Confirm Password</label>
                        <input
                          id="register-confirm-password"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full p-3 rounded-lg border bg-background"
                          autoComplete="new-password"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
