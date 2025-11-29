
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon, User, LogOut, Shield, Edit, Facebook, Instagram } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/customSupabaseClient';

const DEFAULT_LOGO = 'https://horizons-cdn.hostinger.com/c18b618d-7399-4232-9a94-f974a0bdecb5/061c15a45918afd6f0222252773611d0.png';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [socialLinks, setSocialLinks] = useState({ facebook: '#', instagram: '#' });
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['social_links', 'home_images']);
        
        if (data) {
          const socialData = data.find(s => s.key === 'social_links');
          const homeImagesData = data.find(s => s.key === 'home_images');
          
          if (socialData?.value) {
            setSocialLinks(socialData.value);
          }
          if (homeImagesData?.value?.logo) {
            setLogoUrl(homeImagesData.value.logo);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch header settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Blog', path: '/blog' },
    { name: 'Community', path: '/community' },
    { name: 'Solutions', path: '/solutions' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border py-3">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4 group"> {/* Increased gap for larger logo/text */}
                <div className="w-16 h-16 rounded-full border-2 border-white group-hover:scale-105 transition-transform">
                     <img alt="Vellio Nation Logo" className="w-full h-full rounded-full object-cover" src={logoUrl} />
                </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-3xl font-bold text-primary hidden sm:block" // Increased font size
              >
                Vellio Nation
              </motion.div>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Open Facebook page" className="text-muted-foreground hover:text-secondary transition-colors"><Facebook className="h-6 w-6" /></a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Open Instagram page" className="text-muted-foreground hover:text-secondary transition-colors"><Instagram className="h-6 w-6" /></a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-foreground/80 hover:text-primary transition-colors font-semibold text-lg" // Increased font size and weight
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-lg">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile?.name || 'User'} 
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    <span>{profile?.name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-5 w-5" /> {/* Increased icon size */}
                    Profile
                  </DropdownMenuItem>
                  {(profile?.role === 'admin' || profile?.role === 'blogger') && (
                     <DropdownMenuItem onClick={() => navigate('/dashboard/write')}>
                       <Edit className="mr-2 h-5 w-5" /> {/* Increased icon size */}
                       Write Post
                     </DropdownMenuItem>
                   )}
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-5 w-5" /> {/* Increased icon size */}
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-5 w-5" /> {/* Increased icon size */}
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-lg"> {/* Increased text size */}
                  Sign In
                </Button>
                <Button onClick={() => navigate('/register')} className="text-lg"> {/* Increased text size */}
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pb-4 space-y-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block text-foreground/80 hover:text-primary transition-colors font-medium text-lg py-2" // Increased font size and padding
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors font-medium text-lg py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile?.name || 'User'} 
                      className="h-6 w-6 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  Profile
                </Link>
                {(profile?.role === 'admin' || profile?.role === 'blogger') && (
                  <Link
                    to="/dashboard/write"
                    className="block text-foreground/80 hover:text-primary transition-colors font-medium text-lg py-2 flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Edit className="h-5 w-5" /> Write Post
                  </Link>
                )}
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-foreground/80 hover:text-primary transition-colors font-medium text-lg py-2 flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-5 w-5" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-foreground/80 hover:text-primary transition-colors font-medium text-lg py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-foreground/80 hover:text-primary transition-colors font-medium text-lg py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-foreground/80 hover:text-primary transition-colors font-medium text-lg py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
            
            <div className="flex items-center gap-4 pt-4 border-t">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Open Facebook page" className="text-muted-foreground hover:text-secondary transition-colors"><Facebook className="h-6 w-6" /></a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Open Instagram page" className="text-muted-foreground hover:text-secondary transition-colors"><Instagram className="h-6 w-6" /></a>
            </div>

            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="w-full justify-start text-lg py-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="mr-2 h-6 w-6" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-6 w-6" /> Dark Mode
                </>
              )}
            </Button>
          </motion.div>
        )}
      </nav>
    </header>
  );
};

export default Header;
