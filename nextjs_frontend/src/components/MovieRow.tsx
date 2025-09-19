"use client";

import { useEffect, useState } from "react";
import { TmdbMovie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import { getOmdbMocks } from "@/lib/omdb";

export default function MovieRow({ title, fetcher }: { title: string; fetcher: () => Promise<TmdbMovie[]> }) {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.debug("[MovieRow] start fetch:", title);
        const data = await fetcher();
        console.debug("[MovieRow] fetched", Array.isArray(data) ? data.length : 0, "items for", title);

        // If OMDb mocks are provided, map them to lightweight TMDb-like cards and append.
        const mocks = getOmdbMocks();
        let mockAsTmdb: TmdbMovie[] = [];
        if (mocks.length > 0) {
          mockAsTmdb = mocks.map((m, idx) => ({
            id: 9000000 + idx, // synthetic id to avoid collision
            title: m.Title,
            overview: m.Plot || "",
            poster_path: null, // we don't have TMDb poster; MovieCard uses next/image with TMDb paths, so leave null
            backdrop_path: null,
            vote_average: Number(m.imdbRating || "0") || 0,
            name: undefined,
            release_date: undefined,
            first_air_date: undefined,
          }));
          console.debug("[MovieRow] appended OMDb mock items:", mockAsTmdb.length);
        }

        const combined = [...data, ...mockAsTmdb];
        if (mounted) setMovies(combined);
      } catch (e) {
        console.warn("[MovieRow] fetch error for", title, (e as Error)?.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetcher, title]);

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
