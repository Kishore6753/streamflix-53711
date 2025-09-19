export type OmdbRating = {
  Source: string;
  Value: string;
};

export type OmdbMovie = {
  Title: string;
  Year: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster?: string; // URL
  Ratings?: OmdbRating[];
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID?: string;
  Type?: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  Response?: string;
};

const OMDB_BASE = "https://www.omdbapi.com/";

/**
 * Attempt to parse the env var NEXT_PUBLIC_OMDB_API_KEY as a JSON string containing a sample OMDb response.
 * If parsing fails, return null.
 */
function getMockFromEnv(): OmdbMovie | null {
  const raw = process.env.NEXT_PUBLIC_OMDB_API_KEY;
  if (!raw) return null;
  try {
    // The request specifies this env contains sample Guardians Vol. 2 JSON as a string for demo
    const parsed = JSON.parse(raw) as OmdbMovie;
    if (parsed && typeof parsed === "object") return parsed;
    return null;
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * fetchOmdbById
 * Fetch a movie by IMDb ID (imdbID). In mock mode, returns the parsed JSON from NEXT_PUBLIC_OMDB_API_KEY.
 * In live mode (if NEXT_PUBLIC_OMDB_API_KEY contains a real key), calls OMDb API with i=<id>.
 */
export async function fetchOmdbById(imdbID: string): Promise<OmdbMovie | null> {
  /** This is a public function. */
  // If env contains mock JSON, prefer it to demonstrate UI without live requests
  const mock = getMockFromEnv();
  if (mock) {
    // If the mock has an imdbID and it doesn't match, still return it for demo purposes
    return mock;
  }

  // Fallback to live API if an actual API key is provided in NEXT_PUBLIC_OMDB_API_KEY (not JSON)
  const key = process.env.NEXT_PUBLIC_OMDB_API_KEY || "";
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("OMDb key not set; returning null.");
    }
    return null;
  }

  const params = new URLSearchParams({ i: imdbID, apikey: key });
  const res = await fetch(`${OMDB_BASE}?${params.toString()}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  const data = (await res.json()) as OmdbMovie;
  if (data.Response === "False") return null;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * fetchOmdbByTitle
 * Fetch a movie by title. In mock mode, returns the parsed JSON from NEXT_PUBLIC_OMDB_API_KEY.
 * In live mode, calls OMDb API with t=<title>.
 */
export async function fetchOmdbByTitle(title: string): Promise<OmdbMovie | null> {
  /** This is a public function. */
  const mock = getMockFromEnv();
  if (mock) return mock;

  const key = process.env.NEXT_PUBLIC_OMDB_API_KEY || "";
  if (!key || !title) return null;

  const params = new URLSearchParams({ t: title, apikey: key });
  const res = await fetch(`${OMDB_BASE}?${params.toString()}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  const data = (await res.json()) as OmdbMovie;
  if (data.Response === "False") return null;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * formatRatings
 * Convert OMDb ratings array into simplified label/value tuples for UI display.
 */
export function formatRatings(ratings?: OmdbRating[]): Array<{ label: string; value: string }> {
  /** This is a public function. */
  if (!ratings || ratings.length === 0) return [];
  return ratings.map((r) => ({ label: r.Source, value: r.Value }));
}
