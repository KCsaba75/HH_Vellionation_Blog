import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = useCallback(async (user) => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`*`)
          .eq('id', user.id)
          .single();

        // PGRST116 means no rows found - user's profile was deleted
        if (error?.code === 'PGRST116') {
          console.warn('Profile not found, signing out user');
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          return;
        }

        if (error) {
          throw error;
        }

        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
  }, []);


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await getProfile(currentUser);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    const fetchInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await getProfile(currentUser);
      }
      setLoading(false);
    };
    fetchInitialSession();

    return () => subscription.unsubscribe();
  }, [getProfile]);

  const signUp = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }
    return { user: data.user, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    
    // Always clear local state, even if server signOut fails
    // This handles cases where user was deleted but JWT still exists
    setUser(null);
    setSession(null);
    setProfile(null);

    if (error && error.message !== 'User from sub claim in JWT does not exist') {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);
  
  const updateProfile = async (updates) => {
    if (!user) return;
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if(error){
            throw error;
        }
        setProfile(data);
        toast({ title: 'Profile Updated!' });
    } catch(error) {
        toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    }
  }

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: error.message || "Something went wrong",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    }

    return { error };
  }, [toast]);

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Password Update Failed",
        description: error.message || "Something went wrong",
      });
    } else {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    isAdmin: profile?.role === 'admin'
  }), [user, profile, session, loading, signUp, signIn, signOut, updateProfile, resetPassword, updatePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};