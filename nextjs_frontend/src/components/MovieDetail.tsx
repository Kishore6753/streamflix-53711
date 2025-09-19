"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMovieDetails, tmdbImage, TmdbVideo } from "@/lib/tmdb";
import Image from "next/image";
import VideoPlayer from "./VideoPlayer";
import { fetchOmdbById, fetchOmdbByTitle, formatRatings, type OmdbMovie } from "@/lib/omdb";

export default function MovieDetail({ id }: { id: number }) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [overview, setOverview] = useState<string>("");
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const [trailer, setTrailer] = useState<TmdbVideo | null>(null);
  const [omdb, setOmdb] = useState<OmdbMovie | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Fetch TMDb details + videos for trailer
        const { details, videos } = await fetchMovieDetails(id);
        const tmdbTitle = details.title || details.name || "Untitled";
        setTitle(tmdbTitle);
        setOverview(details.overview || "");
        setBackdrop(details.backdrop_path || details.poster_path || null);
        const firstTrailer = videos.find((v) => v.site === "YouTube" && v.type.toLowerCase().includes("trailer"));
        setTrailer(firstTrailer || null);

        // Try OMDb: prefer imdbID if available, else use title
        let omdbData: OmdbMovie | null = null;
        if (details.imdb_id) {
          omdbData = await fetchOmdbById(details.imdb_id);
        }
        if (!omdbData) {
          omdbData = await fetchOmdbByTitle(tmdbTitle);
        }
        setOmdb(omdbData);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const ratings = useMemo(() => formatRatings(omdb?.Ratings), [omdb]);

  if (loading) {
    return <div className="container-px py-10">Loading…</div>;
  }

  const posterSrc = omdb?.Poster || "";

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

          {/* OMDb metadata panel (below trailer) */}
          {omdb && (
            <div className="mt-6 card p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
                <div>
                  <p><span className="font-medium text-gray-900">Year:</span> {omdb.Year}</p>
                  {omdb.Runtime && <p><span className="font-medium text-gray-900">Runtime:</span> {omdb.Runtime}</p>}
                  {omdb.Genre && <p><span className="font-medium text-gray-900">Genre:</span> {omdb.Genre}</p>}
                  {omdb.Director && <p><span className="font-medium text-gray-900">Director:</span> {omdb.Director}</p>}
                </div>
                <div>
                  {omdb.Actors && <p><span className="font-medium text-gray-900">Actors:</span> {omdb.Actors}</p>}
                  {omdb.Awards && <p><span className="font-medium text-gray-900">Awards:</span> {omdb.Awards}</p>}
                  {omdb.imdbRating && <p><span className="font-medium text-gray-900">IMDb:</span> ⭐ {omdb.imdbRating} ({omdb.imdbVotes ?? "N/A"} votes)</p>}
                </div>
              </div>
              {ratings.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ratings.map((r) => (
                    <span key={r.label} className="badge">{r.label}: {r.value}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="md:col-span-1">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Overview</h2>
            <p className="text-gray-700">{overview || omdb?.Plot || "No overview available."}</p>
            {posterSrc ? (
              <div className="mt-4">
                {/* Next Image can optimize remote poster if allowed in next.config.ts. OMDb poster domain varies; fallback to img with native tag. */}
                <img
                  src={posterSrc}
                  alt={omdb?.Title || title}
                  className="w-full rounded-lg border border-blue-100 shadow-sm object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
