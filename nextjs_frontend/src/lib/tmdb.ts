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

// Minimal demo fallback record resembling "Guardians of the Galaxy Vol. 2"
const demoFallback: TmdbMovie = {
  id: 283995,
  title: "Guardians of the Galaxy Vol. 2",
  name: undefined,
  overview:
    "The Guardians struggle to keep together as a team while dealing with their personal family issues, notably Star-Lord's encounter with his father the ambitious celestial being Ego.",
  poster_path: "/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg",
  backdrop_path: "/aJn9XeesqsrSLKcHfHP4u5985hn.jpg",
  release_date: "2017-04-19",
  first_air_date: undefined,
  vote_average: 7.6,
};

function getApiKey() {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  return key || "";
}

async function tmdbFetch<T>(path: string, query: Record<string, string | number> = {}): Promise<T> {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    ...Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)])),
  });
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
 * Fetch trending movies and shows (day). Returns demo fallback if API unavailable.
 */
export async function fetchTrending(): Promise<TmdbMovie[]> {
  /** This is a public function. */
  try {
    const data = await tmdbFetch<{ results: TmdbMovie[] }>("/trending/all/day");
    const results = data.results ?? [];
    return results.length > 0 ? results : [demoFallback];
  } catch {
    return [demoFallback];
  }
}

/**
 * PUBLIC_INTERFACE
 * fetchByCategory
 * Fetch movies by a TMDb category endpoint. Returns demo fallback on error.
 */
export async function fetchByCategory(
  category: "now_playing" | "popular" | "top_rated" | "upcoming"
): Promise<TmdbMovie[]> {
  /** This is a public function. */
  try {
    const data = await tmdbFetch<{ results: TmdbMovie[] }>(`/movie/${category}`);
    const results = data.results ?? [];
    return results.length > 0 ? results : [demoFallback];
  } catch {
    return [demoFallback];
  }
}

/**
 * PUBLIC_INTERFACE
 * searchMovies
 * Search movies/shows by query. Returns empty if query missing; demo fallback on API error.
 */
export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  /** This is a public function. */
  if (!query) return [];
  try {
    const data = await tmdbFetch<{ results: TmdbMovie[] }>("/search/multi", { query });
    return data.results ?? [];
  } catch {
    // For search, fallback to demo only if the query roughly matches the demo title
    if ("guardians of the galaxy vol. 2".includes(query.toLowerCase())) {
      return [demoFallback];
    }
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * fetchMovieDetails
 * Fetch movie details with videos for trailer playback. Returns demo details on error.
 */
type TmdbMovieDetails = TmdbMovie & {
  genres?: { id: number; name: string }[];
  runtime?: number;
  status?: string;
  homepage?: string | null;
  imdb_id?: string | null;
};

export async function fetchMovieDetails(
  id: number
): Promise<{ details: TmdbMovieDetails; videos: TmdbVideo[] }> {
  /** This is a public function. */
  try {
    const details = await tmdbFetch<TmdbMovieDetails>(`/movie/${id}`);
    const vids = await tmdbFetch<{ results: TmdbVideo[] }>(`/movie/${id}/videos`);
    return { details, videos: vids.results ?? [] };
  } catch {
    // Provide minimal demo details if id matches demo or when API fails
    const details: TmdbMovieDetails = {
      ...demoFallback,
      imdb_id: "tt3896198",
    };
    const videos: TmdbVideo[] = []; // No trailer fallback known here
    return { details, videos };
  }
}

export function tmdbImage(
  path: string | null,
  size: "w300" | "w500" | "w780" | "original" = "w500"
) {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Export demo for components that might need a guaranteed sample
export const TMDB_DEMO_FALLBACK = demoFallback;
