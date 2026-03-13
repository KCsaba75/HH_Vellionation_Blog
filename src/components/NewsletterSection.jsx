import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subscribeToNewsletter } from '@/lib/newsletterService';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setError('');

    const res = await subscribeToNewsletter(email, name);

    if (res.success) {
      setStatus('success');
      setEmail('');
      setName('');
    } else if (res.alreadySubscribed) {
      setStatus('success');
      setError('already');
    } else {
      setStatus('error');
      setError(res.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-6">
            <Mail className="h-7 w-7 text-primary" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Your Free 7-Day Wellness Reset Plan
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of women over 40 who are transforming their health — practical tips on weight loss, metabolism, and energy, delivered straight to your inbox. Free, always.
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-xl font-semibold">
                {error === 'already' ? "You're already on the list!" : "You're in! Check your inbox."}
              </p>
              <p className="text-muted-foreground text-sm">
                {error === 'already'
                  ? "We already have your email — you'll keep getting great content."
                  : "Your 7-day wellness plan is on its way. Welcome to the Nation!"}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="text"
                placeholder="First name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-shrink-0 sm:w-36 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="flex-shrink-0 gap-2"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Get it free <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            No spam, ever. Unsubscribe anytime with one click.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
