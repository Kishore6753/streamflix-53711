"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchTrending, tmdbImage, TmdbMovie } from "@/lib/tmdb";

export default function Banner() {
  const [featured, setFeatured] = useState<TmdbMovie | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchTrending();
        const choice = data.find((m) => m.backdrop_path) || data[0];
        setFeatured(choice || null);
      } catch {
        setFeatured(null);
      }
    })();
  }, []);

  const title = useMemo(() => featured?.title || featured?.name || "Featured", [featured]);

  return (
    <section className="relative h-[46vh] w-full overflow-hidden rounded-b-3xl border-b border-blue-100/60">
      {featured && featured.backdrop_path && (
        <Image
          src={tmdbImage(featured.backdrop_path, "w780")}
          alt={title}
          fill
          priority
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/20 to-transparent" />
      <div className="relative container-px h-full flex flex-col justify-end pb-8 gap-3">
        <span className="badge bg-amber-100 text-amber-700 w-max">Featured</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow">{title}</h1>
        <p className="max-w-2xl text-white/90 line-clamp-3">{featured?.overview}</p>
        {featured && (
          <div className="mt-2 flex gap-3">
            <Link href={`/movie/${featured.id}`} className="btn btn-secondary shadow">Watch Trailer</Link>
            <Link href={`/movie/${featured.id}`} className="btn bg-white/90 hover:bg-white text-gray-900 shadow">More Info</Link>
          </div>
        )}
      </div>
    </section>
  );
}
