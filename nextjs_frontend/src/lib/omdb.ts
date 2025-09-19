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
 * Try to parse a JSON string that may be raw or wrapped in quotes and with escaped quotes.
 */
function tryParseJson<T>(raw: string): T | null {
  const trimmed = raw.trim();
  const looksLikeQuoted =
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'));
  const candidate = looksLikeQuoted ? trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, "") : trimmed;

  try {
    return JSON.parse(candidate) as T;
  } catch (e) {
    if (typeof window !== "undefined") {
      console.debug("[OMDb] JSON parse failed:", (e as Error)?.message);
    }
    return null;
  }
}

/**
 * Parse multiple OMDb mock movies from env.
 * Priority:
 * 1) NEXT_PUBLIC_OMDB_MOCK_MOVIES if present as JSON array
 * 2) If NEXT_PUBLIC_OMDB_API_KEY contains a JSON array, use that (backward compat)
 * 3) If NEXT_PUBLIC_OMDB_API_KEY contains a single JSON object, return [object]
 * Otherwise return [] meaning live mode or no mocks.
 */
function getMockArrayFromEnv(): OmdbMovie[] {
  const multiRaw = process.env.NEXT_PUBLIC_OMDB_MOCK_MOVIES;
  if (multiRaw) {
    const parsed = tryParseJson<unknown>(multiRaw);
    if (Array.isArray(parsed)) {
      const movies = parsed.filter((m) => m && typeof m === "object") as OmdbMovie[];
      if (typeof window !== "undefined") {
        console.debug("[OMDb] Using MULTI MOCK from NEXT_PUBLIC_OMDB_MOCK_MOVIES. Count:", movies.length);
      }
      return movies;
    }
  }

  const keyRaw = process.env.NEXT_PUBLIC_OMDB_API_KEY;
  if (!keyRaw) return [];

  // If keyRaw is a JSON array, use it
  const parsedKey = tryParseJson<unknown>(keyRaw);
  if (Array.isArray(parsedKey)) {
    const movies = parsedKey.filter((m) => m && typeof m === "object") as OmdbMovie[];
    if (typeof window !== "undefined") {
      console.debug("[OMDb] Using MULTI MOCK from NEXT_PUBLIC_OMDB_API_KEY (array). Count:", movies.length);
    }
    return movies;
  }
  // If it is a single object, return as array (back-compat)
  if (parsedKey && typeof parsedKey === "object" && (parsedKey as OmdbMovie).Title) {
    if (typeof window !== "undefined") {
      console.debug("[OMDb] Using SINGLE MOCK from NEXT_PUBLIC_OMDB_API_KEY (object).");
    }
    return [parsedKey as OmdbMovie];
  }
  return [];
}



/**
 * PUBLIC_INTERFACE
 * getOmdbMocks
 * Return all OMDb mock movies parsed from env (may be empty).
 */
export function getOmdbMocks(): OmdbMovie[] {
  /** This is a public function. */
  return getMockArrayFromEnv();
}

/**
 * PUBLIC_INTERFACE
 * getRandomOmdbMock
 * Returns a random OMDb mock movie if available; otherwise null.
 */
export function getRandomOmdbMock(): OmdbMovie | null {
  /** This is a public function. */
  const arr = getMockArrayFromEnv();
  if (arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

/**
 * PUBLIC_INTERFACE
 * fetchOmdbById
 * Fetch a movie by IMDb ID (imdbID). In mock mode, returns the parsed JSON from env (first match by imdbID or any).
 * In live mode (if NEXT_PUBLIC_OMDB_API_KEY contains a real key), calls OMDb API with i=<id>.
 */
export async function fetchOmdbById(imdbID: string): Promise<OmdbMovie | null> {
  /** This is a public function. */
  const mocks = getMockArrayFromEnv();
  if (mocks.length > 0) {
    const match = mocks.find((m) => m.imdbID === imdbID) || mocks[0];
    if (typeof window !== "undefined") {
      console.debug("[OMDb] fetchOmdbById using MOCK array. imdbID:", imdbID, "match:", match?.Title);
    }
    return match || null;
  }

  const key = process.env.NEXT_PUBLIC_OMDB_API_KEY || "";
  if (!key) {
    if (typeof window !== "undefined") {
      console.warn("[OMDb] fetchOmdbById: OMDb key not set; returning null.");
    }
    return null;
  }

  const params = new URLSearchParams({ i: imdbID, apikey: key });
  const url = `${OMDB_BASE}?${params.toString()}`;
  if (typeof window !== "undefined") {
    console.debug("[OMDb] fetchOmdbById LIVE request:", url.replace(key, "***"));
  }
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    if (typeof window !== "undefined") {
      console.warn("[OMDb] fetchOmdbById response not ok:", res.status, res.statusText);
    }
    return null;
  }
  const data = (await res.json()) as OmdbMovie;
  if (data.Response === "False") {
    if (typeof window !== "undefined") {
      console.warn("[OMDb] fetchOmdbById returned Response=False for", imdbID);
    }
    return null;
  }
  if (typeof window !== "undefined") {
    console.debug("[OMDb] fetchOmdbById success. Title:", data.Title, "Year:", data.Year);
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 * fetchOmdbByTitle
 * Fetch a movie by title. In mock mode, returns a matching mock by Title (case-insensitive) or the first mock.
 * In live mode, calls OMDb API with t=<title>.
 */
export async function fetchOmdbByTitle(title: string): Promise<OmdbMovie | null> {
  /** This is a public function. */
  const mocks = getMockArrayFromEnv();
  if (mocks.length > 0) {
    const t = (title || "").toLowerCase();
    const match =
      mocks.find((m) => (m.Title || "").toLowerCase() === t) ||
      mocks.find((m) => (m.Title || "").toLowerCase().includes(t)) ||
      mocks[0];
    if (typeof window !== "undefined") {
      console.debug("[OMDb] fetchOmdbByTitle using MOCK array. requested:", title, "match:", match?.Title);
    }
    return match || null;
  }

  const key = process.env.NEXT_PUBLIC_OMDB_API_KEY || "";
  if (!key || !title) {
    if (typeof window !== "undefined") {
      console.warn("[OMDb] fetchOmdbByTitle missing key or title. key?", Boolean(key), "title?", Boolean(title));
    }
    return null;
  }

  const params = new URLSearchParams({ t: title, apikey: key });
  const url = `${OMDB_BASE}?${params.toString()}`;
  if (typeof window !== "undefined") {
    console.debug("[OMDb] fetchOmdbByTitle LIVE request:", url.replace(key, "***"));
  }
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    if (typeof window !== "undefined") {
      console.warn("[OMDb] fetchOmdbByTitle response not ok:", res.status, res.statusText);
    }
    return null;
  }
  const data = (await res.json()) as OmdbMovie;
  if (data.Response === "False") {
    if (typeof window !== "undefined") {
      console.warn("[OMDb] fetchOmdbByTitle returned Response=False for", title);
    }
    return null;
  }
  if (typeof window !== "undefined") {
    console.debug("[OMDb] fetchOmdbByTitle success. Title:", data.Title, "Year:", data.Year);
  }
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
