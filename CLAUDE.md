# PageNest

Deliberately tiny landing-page builder, used as a host app for testing a third-party widget later. Keep it simple. No widget/embed/iframe code lives here yet.

## Stack
Vite + React + TypeScript + Tailwind v4 + React Router + @supabase/supabase-js. Deployed on Vercel (`vercel.json` SPA rewrite).

## Commands
- `npm run dev` / `npm run build` (tsc + vite build) / `npm run preview`

## Env
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable key) in `.env.local` (gitignored); template in `.env.example`.

## Routes
`/` marketing, `/login`, `/signup`, `/dashboard`, `/editor/:id` (form, live preview, Save/Publish, empty "Tools" section `#tools`), `/p/:slug` (public), `/settings`. Dashboard, editor and settings require auth.

## Data
`supabase/schema.sql`: table `pages` with RLS (owners full CRUD; anon can select where `published = true`). Slug = slugified headline + random suffix, generated in `src/lib/pages.ts`.

## Design tokens
Defined as CSS variables in `src/index.css` and exposed as Tailwind theme colors:
`--accent #4f46e5`, `--background`, `--surface`, `--text`, `--muted`, `--border`, `--radius`, `--font`.
Use `bg-accent`, `bg-background`, `bg-surface`, `text-text`, `text-muted`, `border-border`, `rounded-token`. Reuse `Button`, `Input`, `Card` from `src/components/ui.tsx`.

## Layout
- `src/main.tsx` - router
- `src/pages/` - route components
- `src/components/` - `ui.tsx` (Button/Input/Card), `Layout.tsx` (shell + auth guard), `PagePreview.tsx` (shared by editor preview and public page)
- `src/lib/` - `supabase.ts`, `auth.tsx`, `pages.ts`
- `supabase/schema.sql`
