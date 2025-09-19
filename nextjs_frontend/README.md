# StreamFlix – Next.js + Supabase + TMDb (+ OMDb for enrichment)

Netflix-like web application built with Next.js App Router, Tailwind CSS, Supabase authentication (Google + Email), and TMDb for real movie data. OMDb is used to enrich movie details (poster, ratings, metadata) via a mock sample or a live API key.

## Features
- Modern Ocean Professional theme with blue/amber accents
- Top navbar with search, auth actions, and watchlist
- Featured banner hero and horizontal category rows
- Movie details page with trailer playback (YouTube)
- OMDb enrichment on movie details (poster, ratings like IMDb/Rotten Tomatoes/Metacritic)
- Supabase auth (Google OAuth, Email magic link)
- Favorites/Watchlist stored in Supabase Postgres
- Works on Vercel; image optimization for TMDb domains

## Prerequisites
- Node.js 18+
- Supabase project with anon/public key
- TMDb API key (free)
- Optional: OMDb API key (free) OR use provided mock sample(s) via env

## Environment Setup
Copy .env.example to .env.local and fill values:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_KEY=...
NEXT_PUBLIC_TMDB_API_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# OMDb integration: you can use live mode OR mock mode (single or multiple)
NEXT_PUBLIC_OMDB_API_KEY=...
# NEW: Multi-movie mock mode
NEXT_PUBLIC_OMDB_MOCK_MOVIES=...
```

### OMDb configuration
We support three ways to configure OMDb:

1) Mock/demo mode (single movie; legacy):
- Set NEXT_PUBLIC_OMDB_API_KEY to a JSON string (stringified OMDb response object).
- Example (single-line JSON; actual value will be much longer):
  NEXT_PUBLIC_OMDB_API_KEY='{"Title":"Guardians of the Galaxy Vol. 2","Year":"2017","imdbID":"tt3896198","Poster":"https://...jpg","Ratings":[{"Source":"Internet Movie Database","Value":"7.6/10"},{"Source":"Rotten Tomatoes","Value":"85%"},{"Source":"Metacritic","Value":"67/100"}],"Plot":"..."}'
- The Movie Detail page and Banner will parse this and display poster/ratings/plot without doing a network request.

2) Mock/demo mode (multiple movies; recommended for local demos):
- Set NEXT_PUBLIC_OMDB_MOCK_MOVIES to a JSON array of OMDb movie objects.
- Example:
  NEXT_PUBLIC_OMDB_MOCK_MOVIES='[
    {"Title":"Guardians of the Galaxy Vol. 2","Year":"2017","imdbID":"tt3896198","Poster":"https://...jpg","Ratings":[{"Source":"Internet Movie Database","Value":"7.6/10"}],"Plot":"..."},
    {"Title":"Interstellar","Year":"2014","imdbID":"tt0816692","Poster":"https://...jpg","Ratings":[{"Source":"Internet Movie Database","Value":"8.6/10"}],"Plot":"..."}
  ]'
- Banner will randomly pick one of these for title/plot; MovieRow will append these mock items as separate cards; Movie Detail will match by imdbID/title when possible.

3) Live API mode:
- Set NEXT_PUBLIC_OMDB_API_KEY to your actual OMDb API key (not JSON).
- The app will call https://www.omdbapi.com/?apikey=YOUR_KEY with the IMDb ID (when available) or the title as a fallback.
- Note: OMDb image domains are not added to next.config.ts. We render the Poster with an <img> tag (not next/image) to avoid domain config changes.

Backward compatibility:
- If NEXT_PUBLIC_OMDB_API_KEY contains a JSON array, it will be treated the same as NEXT_PUBLIC_OMDB_MOCK_MOVIES.
- If NEXT_PUBLIC_OMDB_API_KEY contains a single JSON object, legacy single-movie mock continues to work.

## How OMDb is used
- We continue to fetch core movie details and trailers from TMDb.
- We then enrich the detail page with OMDb data:
  - Poster (omdb.Poster)
  - Ratings (IMDb, Rotten Tomatoes, Metacritic)
  - Metadata like Year, Runtime, Genre, Director, Actors, Awards
  - Plot (used as a fallback if TMDb overview is empty)
- Files:
  - src/lib/omdb.ts: getOmdbMocks, getRandomOmdbMock, fetchOmdbById, fetchOmdbByTitle, formatRatings, and parsing from env (single or multi)
  - components/MovieDetail.tsx: shows OMDb poster/ratings/metadata, prefers mocks if provided
  - components/Banner.tsx: prefers a random mock movie’s Title/Plot when mocks are available
  - components/MovieRow.tsx: appends mock movies as additional cards

## Development
Install deps and run:
```
npm install
npm run dev
```
Open http://localhost:3000

## Deployment (Vercel)
- Import the project into Vercel
- Set Environment Variables:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_KEY
  - NEXT_PUBLIC_TMDB_API_KEY
  - NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
  - EITHER:
    - NEXT_PUBLIC_OMDB_API_KEY=<live key>  (Live mode)
    - OR NEXT_PUBLIC_OMDB_MOCK_MOVIES='[ ... ]' (Multi-movie mock mode)
    - OR NEXT_PUBLIC_OMDB_API_KEY='{ ... }' (Single-movie legacy mock)
- Build command: `npm run build`
- No special output config required; Next handles routing.

## Notes
- If TMDb key is missing, UI will render with placeholders and no data.
- If Supabase env is missing, auth/watchlist actions are disabled gracefully.
- If NEXT_PUBLIC_OMDB_MOCK_MOVIES is set (or NEXT_PUBLIC_OMDB_API_KEY contains a JSON array), Banner picks a random mock and MovieRow appends all mock movies.

## Roadmap
- AI-powered recommendations
- Infinite scroll & more categories
- Server Actions for favorites to reduce client-side logic
