"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * PUBLIC_INTERFACE
 * getSupabaseClient
 * Create a singleton Supabase client on the client-side using public env vars.
 */
export function getSupabaseClient() {
  /** This is a public function. */
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    // Non-fatal: allow app to render without auth enabled
    if (process.env.NODE_ENV !== "production") {
      console.warn("Supabase env vars missing. Auth features disabled.");
    }
  }

  return createClient(url || "http://localhost", key || "anon-key");
}
