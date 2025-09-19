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
- Optional: OMDb API key (free) OR use provided mock sample via env

## Environment Setup
Copy .env.example to .env.local and fill values:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_KEY=...
NEXT_PUBLIC_TMDB_API_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# OMDb integration: for demo, this can be a JSON string (see below)
NEXT_PUBLIC_OMDB_API_KEY=...
```

### OMDb configuration
We support two modes:

1) Mock/demo mode (default recommended for local):
- Set NEXT_PUBLIC_OMDB_API_KEY to a JSON string (stringified OMDb response object).
- Example (single-line JSON; actual value will be much longer):
  NEXT_PUBLIC_OMDB_API_KEY='{"Title":"Guardians of the Galaxy Vol. 2","Year":"2017","imdbID":"tt3896198","Poster":"https://...jpg","Ratings":[{"Source":"Internet Movie Database","Value":"7.6/10"},{"Source":"Rotten Tomatoes","Value":"85%"},{"Source":"Metacritic","Value":"67/100"}],"Plot":"..."}'
- The Movie Detail page and Banner will parse this and display poster/ratings/plot without doing a network request.

2) Live API mode:
- Set NEXT_PUBLIC_OMDB_API_KEY to your actual OMDb API key (not JSON).
- The app will call https://www.omdbapi.com/?apikey=YOUR_KEY with the IMDb ID (when available) or the title as a fallback.
- Note: OMDb image domains are not added to next.config.ts. We render the Poster with an <img> tag (not next/image) to avoid domain config changes.

## How OMDb is used
- We continue to fetch core movie details and trailers from TMDb.
- We then enrich the detail page with OMDb data:
  - Poster (omdb.Poster)
  - Ratings (IMDb, Rotten Tomatoes, Metacritic)
  - Metadata like Year, Runtime, Genre, Director, Actors, Awards
  - Plot (used as a fallback if TMDb overview is empty)
- Files:
  - src/lib/omdb.ts: fetchOmdbById, fetchOmdbByTitle, formatRatings, and mock parsing from env
  - components/MovieDetail.tsx: shows OMDb poster/ratings/metadata
  - components/Banner.tsx: prefers OMDb Title/Plot when mock/live OMDb is available

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
  - NEXT_PUBLIC_OMDB_API_KEY (either JSON mock or real API key)
- Build command: `npm run build`
- No special output config required; Next handles routing.

## Notes
- If TMDb key is missing, UI will render with placeholders and no data.
- If Supabase env is missing, auth/watchlist actions are disabled gracefully.
- If NEXT_PUBLIC_OMDB_API_KEY contains JSON, we use it as a mock sample; if it looks like a real key, we call OMDb live.

## Roadmap
- AI-powered recommendations
- Infinite scroll & more categories
- Server Actions for favorites to reduce client-side logic
