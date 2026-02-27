import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
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


const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signInWithOAuth } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(formData.email, formData.password);
    if (!error) {
      toast({ title: "Welcome back!", description: "You've successfully logged in." });
      navigate('/blog');
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
        <title>Login - Vellio Nation</title>
        <meta name="description" content="Login to your Vellio Nation account." />
        <meta property="og:title" content="Login - Vellio Nation" />
        <meta property="og:description" content="Login to your Vellio Nation account." />
        <meta property="og:image" content="https://rtklsdtadtqpgoibulux.supabase.co/storage/v1/object/public/site_images/og-image.jpg" />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-8 rounded-xl shadow-lg"
          >
            <h1 className="text-3xl font-bold mb-6 text-center">Welcome Back</h1>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-60"
              >
                <GoogleIcon />
                {oauthLoading === 'google' ? 'Redirecting...' : 'Continue with Google'}
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-card text-muted-foreground">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 rounded-lg border bg-background"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 rounded-lg border bg-background"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Join now
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
