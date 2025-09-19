"use client";

import { useEffect, useState } from "react";
import { TmdbMovie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

export default function MovieRow({ title, fetcher }: { title: string; fetcher: () => Promise<TmdbMovie[]> }) {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetcher();
        if (mounted) setMovies(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetcher]);

  return (
    <section className="container-px my-6">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto scrollbar-slim pr-2">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-40 sm:w-48 h-72 rounded-xl bg-gradient-to-br from-blue-50 to-gray-50 animate-pulse border border-blue-100/40" />
              ))
            : movies.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      </div>
    </section>
  );
}
