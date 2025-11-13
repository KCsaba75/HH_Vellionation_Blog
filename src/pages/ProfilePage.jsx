import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Award, TrendingUp, Edit2, Save, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ProfilePage = () => {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', avatar_url: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  if (authLoading || !profile) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  const ranks = [
    { name: 'New Member', points: 0 },
    { name: 'Contributor', points: 100 },
    { name: 'Health Hero', points: 500 },
    { name: 'Vellio Ambassador', points: 1000 }
  ];

  const currentRankIndex = ranks.findIndex(r => r.name === profile.rank);
  const nextRank = ranks[currentRankIndex + 1];
  const progress = nextRank 
    ? ((profile.points - ranks[currentRankIndex].points) / (nextRank.points - ranks[currentRankIndex].points)) * 100
    : 100;

  const handleSave = async () => {
    await updateProfile(formData);
    setEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

    if (uploadError) {
      toast({ title: "Avatar Upload Failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    setFormData({ ...formData, avatar_url: data.publicUrl });
    await updateProfile({ avatar_url: data.publicUrl });
    setUploading(false);
    toast({ title: "Profile picture updated successfully!" });
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
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm bg-accent/20 text-accent px-3 py-1 rounded-full">{profile.rank}</span>
                      <span className="text-sm text-muted-foreground">{profile.points} points</span>
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

            <div className="bg-card rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Rank Progress</h2>
              </div>
              {nextRank ? (
                <>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{profile.rank}</span>
                    <span className="text-muted-foreground">{profile.points} / {nextRank.points} points</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 mb-2">
                    <div className="bg-primary h-3 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-sm text-muted-foreground">{nextRank.points - profile.points} points until {nextRank.name}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Congratulations! You've reached the highest rank! 🎉</p>
              )}
            </div>

            <div className="bg-card rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-2 mb-6">
                <Award className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Badges & Achievements</h2>
              </div>
              <p className="text-muted-foreground text-center py-8">No badges yet. Coming soon!</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;