"use client";

import Image from "next/image";
import Link from "next/link";
import { TmdbMovie, tmdbImage } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";
import { addFavorite, removeFavorite } from "@/lib/favorites";
import { useState } from "react";

export default function MovieCard({ movie, isFavorite }: { movie: TmdbMovie; isFavorite?: boolean }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const title = movie.title || movie.name || "Untitled";

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Please sign in to manage your list.");
      return;
    }
    setBusy(true);
    try {
      if (isFavorite) {
        await removeFavorite(user.id, movie.id);
      } else {
        await addFavorite({
          user_id: user.id,
          tmdb_id: movie.id,
          title,
          poster_path: movie.poster_path ?? null,
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Action failed";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group relative w-40 sm:w-48 flex-shrink-0 rounded-xl overflow-hidden shadow-md shadow-blue-900/5 border border-blue-100/40 bg-white">
      <Link href={`/movie/${movie.id}`}>
        <Image
          src={tmdbImage(movie.poster_path, "w300") || "/src/app/placeholder.svg"}
          alt={title}
          width={320}
          height={480}
          className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-105 bg-gray-100"
        />
      </Link>
      <div className="p-2">
        <p className="text-sm font-medium text-gray-800 line-clamp-1">{title}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="badge">⭐ {movie.vote_average?.toFixed(1) ?? "N/A"}</span>
          <button
            onClick={handleToggleFavorite}
            disabled={busy}
            className={`btn px-2 py-1 text-xs ${isFavorite ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
            aria-label="Toggle favorite"
            title={isFavorite ? "Remove from My List" : "Add to My List"}
          >
            {isFavorite ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
