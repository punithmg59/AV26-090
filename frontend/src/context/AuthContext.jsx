import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return;
    console.time('profile-fetch');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      console.timeEnd('profile-fetch');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log("🔐 Auth: Starting initialization...");
      console.time('auth-init');
      
      // Failsafe timeout: Force stop loading after 8 seconds
      const failsafe = setTimeout(() => {
        if (mounted && loading) {
          console.warn("⚠️ Auth: Failsafe triggered. Force-stopping loading state.");
          setLoading(false);
        }
      }, 8000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("🔐 Auth: Session retrieved:", session ? "Active" : "None");
        
        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            console.log("🔐 Auth: Fetching profile for:", currentUser.id);
            await fetchProfile(currentUser.id);
          }
        }
      } catch (err) {
        console.error('❌ Auth: Initialization error:', err);
      } finally {
        clearTimeout(failsafe);
        if (mounted) {
          setLoading(false);
          console.log("🔐 Auth: Initialization complete.");
          console.timeEnd('auth-init');
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔐 Auth: onAuthStateChange [${event}]`);
      if (!mounted) return;
      
      try {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (currentUser) {
            console.log("🔐 Auth: Fetching profile on event...");
            await fetchProfile(currentUser.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      } catch (err) {
        console.error("❌ Auth: Change listener error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log("🔐 Auth: Loading state cleared by event.");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async ({ email, password, full_name, phone }) => {
    console.time('signup-flow');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name,
              email,
              phone,
            },
          ]);
        
        if (profileError) throw profileError;
      }
      return data;
    } finally {
      console.timeEnd('signup-flow');
    }
  };

  const signIn = async ({ email, password }) => {
    console.time('login-flow');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } finally {
      console.timeEnd('login-flow');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id)
  }), [user, profile, loading, fetchProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

