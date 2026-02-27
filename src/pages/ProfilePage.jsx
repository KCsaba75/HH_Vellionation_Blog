import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Edit2, Save, Camera, Trash2, Bell, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { convertToWebPForAvatar } from '@/lib/imageUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import RankProgressCard from '@/components/gamification/RankProgressCard';
import BadgeGrid from '@/components/gamification/BadgeGrid';
import DailyLoginButton from '@/components/gamification/DailyLoginButton';
import { getUserStats, getUserBadges, checkAndAwardBadges } from '@/lib/gamificationService';
import { FOUNDING_MEMBER } from '@/lib/gamificationConfig';

const ProfilePage = () => {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', avatar_url: '' });
  const [pendingToggle, setPendingToggle] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [userStats, setUserStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loadingGamification, setLoadingGamification] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (profile) {
      setFormData({ 
        name: profile.name || '', 
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    const loadGamificationData = async () => {
      if (!user) return;
      setLoadingGamification(true);
      try {
        const [stats, userBadges] = await Promise.all([
          getUserStats(user.id),
          getUserBadges(user.id)
        ]);
        setUserStats(stats);
        setBadges(userBadges);
        await checkAndAwardBadges(user.id);
        const updatedBadges = await getUserBadges(user.id);
        setBadges(updatedBadges);
      } catch (error) {
        console.error('Error loading gamification data:', error);
      }
      setLoadingGamification(false);
    };
    loadGamificationData();
  }, [user]);

  const handleDailyLoginClaimed = async () => {
    if (user) {
      const [stats, userBadges] = await Promise.all([
        getUserStats(user.id),
        getUserBadges(user.id)
      ]);
      setUserStats(stats);
      setBadges(userBadges);
    }
  };

  if (authLoading || !profile) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  const handleSave = async () => {
    await updateProfile(formData);
    setEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) {
        toast({ title: "Error deleting account", description: profileError.message, variant: "destructive" });
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        toast({ title: "Account deleted but sign out failed", description: signOutError.message, variant: "destructive" });
      } else {
        toast({ title: "Account deleted successfully" });
        navigate('/');
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAvatarUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    setUploading(true);
    
    try {
      const webpFile = await convertToWebPForAvatar(file, 256, 0.85);
      const fileName = `${user.id}-${Date.now()}.webp`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, webpFile, {
        contentType: 'image/webp'
      });

      if (uploadError) {
        toast({ title: "Avatar Upload Failed", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

      setFormData({ ...formData, avatar_url: data.publicUrl });
      await updateProfile({ avatar_url: data.publicUrl });
      setUploading(false);
      toast({ title: "Profile picture updated successfully!" });
    } catch (err) {
      toast({ title: "Image conversion failed", description: err.message, variant: "destructive" });
      setUploading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile - Vellio Nation</title>
      </Helmet>
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-card rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    {formData.avatar_url ? (
                      <img 
                        src={formData.avatar_url} 
                        alt={profile.name} 
                        className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
                        width="96"
                        height="96"
                      />
                    ) : (
                      <div className="bg-primary/10 rounded-full p-6 h-24 w-24 flex items-center justify-center">
                        <User className="h-12 w-12 text-primary" />
                      </div>
                    )}
                    {editing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {uploading ? (
                          <span className="text-white text-sm">Uploading...</span>
                        ) : (
                          <Camera className="h-8 w-8 text-white" />
                        )}
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-2xl font-bold bg-background border rounded px-2 py-1"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold">{profile.name}</h1>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm bg-accent/20 text-accent px-3 py-1 rounded-full">{profile.rank}</span>
                      <span className="text-sm text-muted-foreground">{profile.points} points</span>
                      {profile.is_founding_member && (
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${FOUNDING_MEMBER.bgColor} ${FOUNDING_MEMBER.color} ${FOUNDING_MEMBER.borderColor}`}>
                          {FOUNDING_MEMBER.icon} {FOUNDING_MEMBER.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant={editing ? "default" : "outline"} onClick={() => editing ? handleSave() : setEditing(true)}>
                  {editing ? <><Save className="mr-2 h-4 w-4" />Save</> : <><Edit2 className="mr-2 h-4 w-4" />Edit</>}
                </Button>
              </div>

              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full p-4 rounded-lg border bg-background resize-none"
                  rows="4"
                />
              ) : (
                <p className="text-muted-foreground">{profile.bio || 'No bio yet. Click edit to add one!'}</p>
              )}
            </div>

            <div className="mb-8">
              <div className="flex justify-end mb-4">
                <DailyLoginButton userId={user.id} onClaimed={handleDailyLoginClaimed} />
              </div>
              <RankProgressCard 
                points={profile.points || 0}
                currentStreak={userStats?.currentStreak || profile.current_streak || 0}
                maxStreak={userStats?.maxStreak || profile.max_streak || 0}
              />
            </div>

            <div className="mb-8">
              <BadgeGrid badges={badges} loading={loadingGamification} />
            </div>

            <div className="bg-card rounded-xl shadow-lg p-8 mt-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Email Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-background/50">
                  <div>
                    <p className="font-medium text-sm">Blog notifications</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Receive an email when a new article is published on Vellio Nation.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (profile.email_notifications) {
                        setPendingToggle('blog');
                      } else {
                        updateProfile({ email_notifications: true });
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${profile.email_notifications ? 'bg-primary' : 'bg-muted'}`}
                    role="switch"
                    aria-checked={profile.email_notifications}
                    aria-label="Blog notifications toggle"
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${profile.email_notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-background/50">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-1.5"><Mail className="h-4 w-4 text-muted-foreground" /> Vellio Nation newsletter</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Updates, community news, new solutions, promotions and wellness tips.</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (profile.newsletter_subscribed) {
                        setPendingToggle('newsletter');
                      } else {
                        await updateProfile({ newsletter_subscribed: true });
                        try {
                          const { addContactToSystemeio, addTagToContact } = await import('@/lib/systemeioClient');
                          if (profile.systemeio_contact_id) {
                            await addTagToContact(profile.systemeio_contact_id, 'newsletter');
                          } else {
                            const contactId = await addContactToSystemeio(profile.email, profile.name, ['newsletter']);
                            if (contactId) {
                              const { supabase } = await import('@/lib/customSupabaseClient');
                              await supabase.from('profiles').update({ systemeio_contact_id: String(contactId) }).eq('id', user.id);
                            }
                          }
                        } catch (e) {
                          console.warn('systeme.io subscribe skipped:', e.message);
                        }
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${profile.newsletter_subscribed ? 'bg-primary' : 'bg-muted'}`}
                    role="switch"
                    aria-checked={profile.newsletter_subscribed}
                    aria-label="Newsletter subscription toggle"
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${profile.newsletter_subscribed ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            <AlertDialog open={pendingToggle === 'blog'} onOpenChange={(open) => { if (!open) setPendingToggle(null); }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Turn off blog notifications?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll stop receiving emails when new articles are published on Vellio Nation. You might miss out on valuable wellness tips, guides, and community updates.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPendingToggle(null)}>Keep notifications</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await updateProfile({ email_notifications: false });
                      setPendingToggle(null);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Turn off
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={pendingToggle === 'newsletter'} onOpenChange={(open) => { if (!open) setPendingToggle(null); }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unsubscribe from newsletter?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll no longer receive our newsletter with community news, new solutions, exclusive wellness content, and promotions. You can resubscribe anytime from this page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPendingToggle(null)}>Stay subscribed</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await updateProfile({ newsletter_subscribed: false });
                      if (profile.systemeio_contact_id) {
                        try {
                          const { removeTagFromContact } = await import('@/lib/systemeioClient');
                          await removeTagFromContact(profile.systemeio_contact_id, 'newsletter');
                        } catch (e) {
                          console.warn('systeme.io unsubscribe skipped:', e.message);
                        }
                      }
                      setPendingToggle(null);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Unsubscribe
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="bg-card rounded-xl shadow-lg p-8 mt-8 border border-destructive/20">
              <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
              <p className="text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;