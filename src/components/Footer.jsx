
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src="https://horizons-cdn.hostinger.com/c18b618d-7399-4232-9a94-f974a0bdecb5/ee6cbd272290ba6f659412a474e03a08.png" alt="Vellio Nation" className="h-10 mb-4" />
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
            Made with <Heart className="h-4 w-4 text-primary fill-primary" /> by Vellio Nation
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
