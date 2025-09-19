"use client";

import { useEffect, useState } from "react";
import { searchMovies, tmdbImage, TmdbMovie } from "@/lib/tmdb";
import Link from "next/link";
import Image from "next/image";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await searchMovies(query);
        setResults(res.slice(0, 10));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      <input
        className="w-full rounded-xl border border-blue-100/50 bg-white/80 backdrop-blur px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search movies, shows..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 animate-pulse">…</div>
      )}
      {results.length > 0 && (
        <div className="absolute mt-2 w-full rounded-xl border border-blue-100 bg-white shadow-lg z-10 max-h-96 overflow-auto">
          <ul className="divide-y divide-blue-50">
            {results.map((m) => {
              const title = m.title || m.name || "Untitled";
              return (
                <li key={`${m.id}-${title}`}>
                  <Link href={`/movie/${m.id}`} className="flex gap-3 p-3 hover:bg-blue-50/60">
                    <Image
                      alt={title}
                      src={tmdbImage(m.poster_path, "w300") || "/src/app/placeholder.svg"}
                      width={40}
                      height={60}
                      className="rounded-md object-cover bg-gray-100"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{title}</span>
                      <span className="text-xs text-gray-600 line-clamp-2">{m.overview}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
