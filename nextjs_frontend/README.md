# StreamFlix – Next.js + Supabase + TMDb

Netflix-like web application built with Next.js App Router, Tailwind CSS, Supabase authentication (Google + Email), and TMDb for real movie data.

## Features
- Modern Ocean Professional theme with blue/amber accents
- Top navbar with search, auth actions, and watchlist
- Featured banner hero and horizontal category rows
- Movie details page with trailer playback (YouTube)
- Supabase auth (Google OAuth, Email magic link)
- Favorites/Watchlist stored in Supabase Postgres
- Works on Vercel; image optimization for TMDb domains

## Prerequisites
- Node.js 18+
- Supabase project with anon/public key
- TMDb API key (free)

## Environment Setup
Copy .env.example to .env.local and fill values:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_KEY=...
NEXT_PUBLIC_TMDB_API_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Schema
Execute in Supabase SQL editor:
```sql
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  created_at timestamp with time zone default now()
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create unique index if not exists favorites_unique on public.favorites(user_id, tmdb_id);

alter table public.favorites enable row level security;

create policy "allow read own" on public.favorites
  for select using (auth.uid() = user_id);

create policy "allow insert own" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "allow delete own" on public.favorites
  for delete using (auth.uid() = user_id);
```

Enable Google OAuth in Supabase Dashboard and set redirect URL to:
- http://localhost:3000
- https://your-vercel-domain.vercel.app

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
- Build command: `npm run build`
- No special output config required; Next handles routing.

## Notes
- If TMDb key is missing, UI will render with placeholders and no data.
- If Supabase env is missing, auth/watchlist actions are disabled gracefully.

## Roadmap
- AI-powered recommendations
- Infinite scroll & more categories
- Server Actions for favorites to reduce client-side logic
