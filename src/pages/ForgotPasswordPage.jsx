import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    
    if (!error) {
      setEmailSent(true);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - Vellio Nation</title>
        <meta name="description" content="Reset your Vellio Nation password." />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-8 rounded-xl shadow-lg"
          >
            {emailSent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-4">Check your email</h1>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Click the link in the email to reset your password.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Login
                </Link>
                
                <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
                <p className="text-muted-foreground mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-background"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
