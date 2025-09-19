"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FavoriteItem, listFavorites } from "@/lib/favorites";
import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb";

export default function WatchlistPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setBusy(true);
    (async () => {
      try {
        const res = await listFavorites(user.id);
        setItems(res);
      } catch {
        setItems([]);
      } finally {
        setBusy(false);
      }
    })();
  }, [user]);

  if (loading) {
    return <main className="container-px py-10">Loading…</main>;
  }

  if (!user) {
    return <main className="container-px py-10">Please sign in to view your list.</main>;
  }

  return (
    <main className="container-px py-6">
      <h1 className="text-2xl font-bold text-gray-900">My List</h1>
      {busy ? (
        <div className="mt-4">Loading…</div>
      ) : items.length === 0 ? (
        <p className="mt-4 text-gray-700">Your list is empty.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((it) => (
            <Link key={`${it.tmdb_id}-${it.created_at}`} href={`/movie/${it.tmdb_id}`} className="group">
              <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
                <Image
                  src={tmdbImage(it.poster_path, "w300") || "/src/app/placeholder.svg"}
                  alt={it.title}
                  width={300}
                  height={450}
                  className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-105 bg-gray-100"
                />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900 line-clamp-1">{it.title}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
