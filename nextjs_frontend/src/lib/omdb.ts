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
  if (!raw) {
    if (typeof window !== "undefined") {
      console.debug("[OMDb] NEXT_PUBLIC_OMDB_API_KEY is missing at runtime.");
    }
    return null;
  }

  const trimmed = raw.trim();
  const looksLikeJson = trimmed.startsWith("{") && trimmed.endsWith("}");
  const looksLikeQuotedJson =
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'));

  const tryParse = (val: string) => {
    try {
      const parsed = JSON.parse(val) as OmdbMovie;
      if (parsed && typeof parsed === "object" && (parsed as OmdbMovie).Title) {
        if (typeof window !== "undefined") {
          console.debug("[OMDb] Using MOCK from env. Title:", parsed.Title, "Year:", parsed.Year);
        }
        return parsed;
      }
      return null;
    } catch (e) {
      if (typeof window !== "undefined") {
        console.debug("[OMDb] Failed to parse MOCK JSON from env. Error:", (e as Error)?.message);
      }
      return null;
    }
  };

  if (looksLikeJson) {
    if (typeof window !== "undefined") {
      console.debug("[OMDb] Env looks like raw JSON. Length:", trimmed.length);
    }
    return tryParse(trimmed);
  }

  if (looksLikeQuotedJson) {
    const unwrapped = trimmed.slice(1, -1);
    const candidate = unwrapped.replace(/\\"/g, '"').replace(/\\n/g, "");
    if (typeof window !== "undefined") {
      console.debug("[OMDb] Env looks like quoted JSON. Unwrapped length:", candidate.length);
    }
    return tryParse(candidate);
  }

  if (typeof window !== "undefined") {
    console.debug(
      "[OMDb] Env looks like LIVE KEY. Length:",
      trimmed.length,
      "Sample prefix:",
      trimmed.slice(0, 4)
    );
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * fetchOmdbById
 * Fetch a movie by IMDb ID (imdbID). In mock mode, returns the parsed JSON from NEXT_PUBLIC_OMDB_API_KEY.
 * In live mode (if NEXT_PUBLIC_OMDB_API_KEY contains a real key), calls OMDb API with i=<id>.
 */
export async function fetchOmdbById(imdbID: string): Promise<OmdbMovie | null> {
  /** This is a public function. */
  const mock = getMockFromEnv();
  if (mock) {
    if (typeof window !== "undefined") {
      console.debug("[OMDb] fetchOmdbById using MOCK. imdbID requested:", imdbID);
    }
    return mock;
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
 * Fetch a movie by title. In mock mode, returns the parsed JSON from NEXT_PUBLIC_OMDB_API_KEY.
 * In live mode, calls OMDb API with t=<title>.
 */
export async function fetchOmdbByTitle(title: string): Promise<OmdbMovie | null> {
  /** This is a public function. */
  const mock = getMockFromEnv();
  if (mock) {
    if (typeof window !== "undefined") {
      console.debug("[OMDb] fetchOmdbByTitle using MOCK. Requested title:", title, "Mock.Title:", mock.Title);
    }
    return mock;
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
