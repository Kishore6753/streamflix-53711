export type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
};

export type TmdbVideo = {
  id: string;
  key: string; // YouTube key
  name: string;
  site: string;
  type: string;
};

const TMDB_BASE = "https://api.themoviedb.org/3";

function getApiKey() {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  return key || "";
}

async function tmdbFetch<T>(path: string, query: Record<string, string | number> = {}): Promise<T> {
  const apiKey = getApiKey();
  const params = new URLSearchParams({ ...Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)])) });
  if (apiKey) params.set("api_key", apiKey);

  const res = await fetch(`${TMDB_BASE}${path}?${params.toString()}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`TMDb request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * PUBLIC_INTERFACE
 * fetchTrending
 * Fetch trending movies and shows (day)
 */
export async function fetchTrending(): Promise<TmdbMovie[]> {
  /** This is a public function. */
  const data = await tmdbFetch<{ results: TmdbMovie[] }>("/trending/all/day");
  return data.results;
}

/**
 * PUBLIC_INTERFACE
 * fetchByCategory
 * Fetch movies by a TMDb category endpoint
 */
export async function fetchByCategory(category: "now_playing" | "popular" | "top_rated" | "upcoming"): Promise<TmdbMovie[]> {
  /** This is a public function. */
  const data = await tmdbFetch<{ results: TmdbMovie[] }>(`/movie/${category}`);
  return data.results;
}

/**
 * PUBLIC_INTERFACE
 * searchMovies
 * Search movies/shows by query
 */
export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  /** This is a public function. */
  if (!query) return [];
  const data = await tmdbFetch<{ results: TmdbMovie[] }>("/search/multi", { query });
  return data.results;
}

/**
 * PUBLIC_INTERFACE
 * fetchMovieDetails
 * Fetch movie details with videos for trailer playback
 */
type TmdbMovieDetails = TmdbMovie & {
  genres?: { id: number; name: string }[];
  runtime?: number;
  status?: string;
  homepage?: string | null;
  imdb_id?: string | null;
};

export async function fetchMovieDetails(id: number): Promise<{ details: TmdbMovieDetails; videos: TmdbVideo[] }> {
  /** This is a public function. */
  const details = await tmdbFetch<TmdbMovieDetails>(`/movie/${id}`);
  const vids = await tmdbFetch<{ results: TmdbVideo[] }>(`/movie/${id}/videos`);
  return { details, videos: vids.results };
}

export function tmdbImage(path: string | null, size: "w300" | "w500" | "w780" | "original" = "w500") {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
