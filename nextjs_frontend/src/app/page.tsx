"use client";

import Banner from "@/components/Banner";
import MovieRow from "@/components/MovieRow";
import { fetchByCategory } from "@/lib/tmdb";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Banner />
      <MovieRow title="Now Playing" fetcher={() => fetchByCategory("now_playing")} />
      <MovieRow title="Popular" fetcher={() => fetchByCategory("popular")} />
      <MovieRow title="Top Rated" fetcher={() => fetchByCategory("top_rated")} />
      <MovieRow title="Upcoming" fetcher={() => fetchByCategory("upcoming")} />
      <footer className="container-px py-10 text-center text-sm text-gray-600">
        <p>
          Built with Next.js, Tailwind CSS, Supabase, and TMDb. Some features require API keys and Supabase configuration.
        </p>
      </footer>
    </main>
  );
}
