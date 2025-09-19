"use client";

import { getSupabaseClient } from "./supabaseClient";

export type FavoriteItem = {
  id?: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  created_at?: string;
};

/**
 * PUBLIC_INTERFACE
 * addFavorite
 * Save a movie to user's favorites in Supabase.
 */
export async function addFavorite(item: Omit<FavoriteItem, "id" | "created_at">) {
  /** This is a public function. */
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("favorites").insert(item).select().single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * removeFavorite
 * Remove a movie from favorites by tmdb_id
 */
export async function removeFavorite(userId: string, tmdbId: number) {
  /** This is a public function. */
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("favorites").delete().match({ user_id: userId, tmdb_id: tmdbId });
  if (error) throw error;
}

/**
 * PUBLIC_INTERFACE
 * listFavorites
 * List favorites for current user
 */
export async function listFavorites(userId: string) {
  /** This is a public function. */
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("favorites").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data as FavoriteItem[];
}
