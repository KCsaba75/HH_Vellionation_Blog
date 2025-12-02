
import React, { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const Footer = memo(() => {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'home_images')
          .single();
        
        if (!error && data?.value?.logo) {
          setLogoUrl(data.value.logo);
        }
      } catch (err) {
        console.warn('Failed to fetch footer logo:', err);
      }
    };
    fetchLogo();
  }, []);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            {logoUrl ? (
              <img src={logoUrl} alt="Vellio Nation" className="h-10 mb-4 rounded-full object-cover" width="40" height="40" loading="lazy" />
            ) : (
              <div className="h-10 w-10 mb-4 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Logo</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Your journey to wellness starts here.
            </p>
          </div>

          <div>
            <span className="font-semibold mb-4 block">Quick Links</span>
            <nav className="flex flex-col space-y-2">
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link to="/community" className="text-sm text-muted-foreground hover:text-primary transition-colors">Community</Link>
              <Link to="/solutions" className="text-sm text-muted-foreground hover:text-primary transition-colors">Solutions</Link>
            </nav>
          </div>

          <div>
            <span className="font-semibold mb-4 block">Support</span>
            <nav className="flex flex-col space-y-2">
              <Link to="/help-center" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            </nav>
          </div>

          <div>
            <span className="font-semibold mb-4 block">Connect</span>
            <p className="text-sm text-muted-foreground">
              Join our community and start your transformation today.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by Vellio Nation
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
