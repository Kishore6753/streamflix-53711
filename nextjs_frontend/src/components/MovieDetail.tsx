"use client";

import { useEffect, useState } from "react";
import { fetchMovieDetails, tmdbImage, TmdbVideo } from "@/lib/tmdb";
import Image from "next/image";
import VideoPlayer from "./VideoPlayer";

export default function MovieDetail({ id }: { id: number }) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [overview, setOverview] = useState<string>("");
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const [trailer, setTrailer] = useState<TmdbVideo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { details, videos } = await fetchMovieDetails(id);
        setTitle(details.title || details.name || "Untitled");
        setOverview(details.overview || "");
        setBackdrop(details.backdrop_path || details.poster_path || null);
        const firstTrailer = videos.find((v) => v.site === "YouTube" && v.type.toLowerCase().includes("trailer"));
        setTrailer(firstTrailer || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="container-px py-10">Loading…</div>;
  }

  return (
    <div className="container-px py-6">
      {backdrop && (
        <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-blue-100/60 bg-gray-100">
          <Image src={tmdbImage(backdrop, "w780")} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">{title}</h1>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {trailer ? (
            <VideoPlayer youtubeKey={trailer.key} />
          ) : (
            <div className="card p-6 text-sm text-gray-600">No trailer available.</div>
          )}
        </div>
        <div className="md:col-span-1">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Overview</h2>
            <p className="text-gray-700">{overview || "No overview available."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
