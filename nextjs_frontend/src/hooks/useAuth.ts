"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined as unknown as AuthContextType | undefined);

/**
 * PUBLIC_INTERFACE
 * AuthProvider
 * React provider that exposes Supabase auth state and actions.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  /** This is a public function. */
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const signInWithGoogle = async () => {
    const site = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : undefined);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: site || undefined },
    });
  };

  const signInWithEmail = async (email: string) => {
    const site = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : undefined);
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: site || undefined,
      },
    });
    alert("Magic link sent! Check your email.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signOut,
  };

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
}

/**
 * PUBLIC_INTERFACE
 * useAuth
 * Hook to access auth context
 */
export function useAuth() {
  /** This is a public function. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
