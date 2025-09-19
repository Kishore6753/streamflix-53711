"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchTrending, tmdbImage, TmdbMovie, TMDB_DEMO_FALLBACK } from "@/lib/tmdb";
import { fetchOmdbByTitle, getRandomOmdbMock, type OmdbMovie } from "@/lib/omdb";

export default function Banner() {
  const [featured, setFeatured] = useState<TmdbMovie | null>(null);
  const [omdb, setOmdb] = useState<OmdbMovie | null>(null);

  useEffect(() => {
    (async () => {
      try {
        console.debug("[Banner] mounted. Hydration check: window?", typeof window !== "undefined");
        // Load a trending item as the background context
        const data = await fetchTrending();
        console.debug("[Banner] fetchTrending returned", Array.isArray(data) ? data.length : 0, "items");
        const candidate = (data && data.length > 0 ? data : [TMDB_DEMO_FALLBACK]);
        const choice = candidate.find((m) => m.backdrop_path) || candidate[0] || TMDB_DEMO_FALLBACK;
        console.debug("[Banner] chosen TMDb item:", { id: choice.id, title: choice.title || choice.name, hasBackdrop: Boolean(choice.backdrop_path) });
        setFeatured(choice);

        // Prefer a random OMDb mock if available; otherwise try live by the TMDb title
        const mock = getRandomOmdbMock();
        if (mock) {
          setOmdb(mock);
        } else {
          const chosenTitle = choice.title || choice.name || "Guardians of the Galaxy Vol. 2";
          console.debug("[Banner] requesting OMDb by title:", chosenTitle);
          const omdbData = await fetchOmdbByTitle(chosenTitle);
          console.debug("[Banner] OMDb result present?", Boolean(omdbData), "title:", omdbData?.Title);
          setOmdb(omdbData);
        }
      } catch (e) {
        console.warn("[Banner] error during load:", (e as Error)?.message);
        // Final fallback to demo
        setFeatured(TMDB_DEMO_FALLBACK);
        const fallback = getRandomOmdbMock() || (await fetchOmdbByTitle("Guardians of the Galaxy Vol. 2"));
        setOmdb(fallback);
      }
    })();
  }, []);

  const title = useMemo(() => omdb?.Title || featured?.title || featured?.name || "Featured", [featured, omdb]);
  const plot = useMemo(() => omdb?.Plot || featured?.overview || "", [featured, omdb]);

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
        <p className="max-w-2xl text-white/90 line-clamp-3">{plot}</p>
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
