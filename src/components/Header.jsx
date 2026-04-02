
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon, User, LogOut, Shield, Edit, Facebook, Instagram, Youtube } from 'lucide-react';
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
import { getSettings } from '@/lib/settingsCache';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '', youtube: '', spotify: '' });
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    getSettings().then(s => {
      if (s.social_links) setSocialLinks(s.social_links);
      if (s.home_images?.logo) setLogoUrl(s.home_images.logo);
    }).catch(err => console.warn('Failed to fetch header settings:', err));
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
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border py-3">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4 group"> {/* Increased gap for larger logo/text */}
                <div className="w-16 h-16 rounded-full border-2 border-white group-hover:scale-105 transition-transform flex items-center justify-center bg-muted">
                     {logoUrl ? (
                       <img alt="Vellio Nation Logo" className="w-full h-full rounded-full object-cover" src={logoUrl} width="64" height="64" />
                     ) : (
                       <span className="text-xs text-muted-foreground text-center px-1">Logo placeholder</span>
                     )}
                </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col"
              >
                <span className="text-3xl font-bold text-primary hidden sm:block">Vellio Nation</span>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground tracking-widest">Feel Good Again</span>
                <span className="hidden sm:block text-xs text-muted-foreground/60 italic tracking-wide">Simple Habits, Lasting Results</span>
              </motion.div>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Open Facebook page" className="text-muted-foreground hover:text-secondary transition-colors"><Facebook className="h-6 w-6" /></a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Open Instagram page" className="text-muted-foreground hover:text-secondary transition-colors"><Instagram className="h-6 w-6" /></a>}
              {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="Open YouTube channel" className="text-muted-foreground hover:text-secondary transition-colors"><Youtube className="h-6 w-6" /></a>}
              {socialLinks.spotify && <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer" aria-label="Open Spotify profile" className="text-muted-foreground hover:text-secondary transition-colors"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></a>}
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
                        width="32"
                        height="32"
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
                  Join Free
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
                      width="24"
                      height="24"
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
                  Join Free
                </Link>
              </>
            )}
            
            <div className="flex items-center gap-4 pt-4 border-t">
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Open Facebook page" className="text-muted-foreground hover:text-secondary transition-colors"><Facebook className="h-6 w-6" /></a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Open Instagram page" className="text-muted-foreground hover:text-secondary transition-colors"><Instagram className="h-6 w-6" /></a>}
              {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="Open YouTube channel" className="text-muted-foreground hover:text-secondary transition-colors"><Youtube className="h-6 w-6" /></a>}
              {socialLinks.spotify && <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer" aria-label="Open Spotify profile" className="text-muted-foreground hover:text-secondary transition-colors"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></a>}
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
    </>
  );
};

export default Header;
