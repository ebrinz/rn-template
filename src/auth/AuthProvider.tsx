import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any } | void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: user changed', user);
  }, [user]);

  useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);
      try {
        const storedSession = await AsyncStorage.getItem('supabaseSession');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          // Rehydrate Supabase internal state
          try {
            await supabase.auth.setSession(parsedSession);
          } catch (e) {
            console.error('Failed to set Supabase session', e);
          }
          setSession(parsedSession);
          setUser(parsedSession?.user ?? null);
        } else {
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (e) {
        console.error('Failed to restore session', e);
      }
      setLoading(false);
    };
    restoreSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        await AsyncStorage.setItem('supabaseSession', JSON.stringify(session));
      } else {
        await AsyncStorage.removeItem('supabaseSession');
      }
      console.log('AuthProvider: onAuthStateChange', { session, user: session?.user });
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await AsyncStorage.setItem('supabaseSession', JSON.stringify(data.session));
      }
      setLoading(false);
      return { error };
    } catch (e) {
      setLoading(false);
      return { error: e };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('supabaseSession');
      setLoading(false);
    } catch (e) {
      console.error('signOut network error', e);
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
