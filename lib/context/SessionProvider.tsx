'use client';

import { useUser } from '@/lib/stores/user';
import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

const SessionProvider = () => {
  const setUser = useUser((state) => state.setUserData);

  useEffect(() => {
    // Initial fetch
    setUser();

    // Listen to auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return null;
};

export default SessionProvider;