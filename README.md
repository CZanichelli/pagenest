# PageNest

A tiny landing-page builder. Sign in, create a page (headline, subheadline, one button, accent color), publish it at `/p/<slug>`.

Stack: Vite, React, TypeScript, Tailwind CSS v4, React Router, Supabase (auth + Postgres).

## Setup

1. Create a Supabase project (email confirmation off).
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the `sb_publishable_...` key).
4. `npm install` then `npm run dev`.

## Commands

- `npm run dev` - dev server
- `npm run build` - type-check and build to `dist/`
- `npm run preview` - serve the build

## Deploy

Vercel. Set the two env vars in the project settings. `vercel.json` rewrites all routes to `index.html` so deep links work.
