import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { updatePassword, session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      const timer = setTimeout(() => {
        if (!session) {
          navigate('/login');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    
    if (!updateError) {
      navigate('/profile');
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-8 rounded-xl shadow-lg text-center"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying your reset link...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password - Vellio Nation</title>
        <meta name="description" content="Set your new Vellio Nation password." />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-8 rounded-xl shadow-lg"
          >
            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
            <p className="text-muted-foreground mb-6">
              Enter your new password below.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg border bg-background pr-10"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border bg-background"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
