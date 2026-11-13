# Ordana integration: CZ's "Headline rewriter"

Pagenest embeds CZ's **Headline rewriter** widget (via Ordana) in the editor's Tools section (`/editor/:id`, `#tools`), in card mode, for signed-in users.
The widget's screens, sign-in, payments and usage counting all run inside CZ's iframe (`https://headlinefix.vercel.app/ordana-widget/embed`). Don't rebuild them or call CZ's routes.

## Shared context
- Sends (on every `ordana-widget:ready`): `draft_title` = the page's Headline field, `audience` = the page's Audience field (`pages.audience`). `{}` when signed out.
- Receives (`ordana-widget:result`, after the user agrees in the widget): `chosen_headline`, `chosen_style`. Validated and stored in `headline_results` (keyed by Pagenest's user id and page id, owner-only RLS). The latest one is shown under the widget with a "Use as headline" button.

## Accounts (Pagenest signs its users in) and checkout (Ordana's)
- When the widget posts `ordana-widget:signin`, the component calls `POST /api/ordana/widget-token` with the user's Supabase access token and posts `{ type: 'ordana-widget:identity', v: 1, token }` back to the embed origin (token `null` when signed out). If nobody is signed in and `reason` is `needed`, it sends the user to `/login?next=<editor>`. A fresh identity is posted when the signed-in user changes.
- The route verifies the session with Supabase and signs a 120 s HS256 JWT: `kid` = `ORDANA_SERVER_KEY_ID`, `aud` = the widget key, `sub` = the Supabase user id (one person, one id), `name` = the display name from Settings (omitted if unset). Never the email.
- `ORDANA_SERVER_KEY_ID` / `ORDANA_SERVER_SECRET`: server env only (`.env.local` and Vercel project env). Never in browser code, logs or commits.
- Payment stays in the widget on Ordana's checkout; Pagenest has no billing code for it.

## Files
- `src/components/HeadlineRewriter.tsx` - iframe, embed URL with design tokens, resize/context/result/signin listeners, latest-result panel
- `api/ordana/widget-token.ts` - Vercel function that signs the widget identity token
- `vercel.json` - SPA rewrite skips `/api/`
- `src/pages/Settings.tsx` - Display name (Supabase `user_metadata.display_name`), sent as the token's `name`
- `src/pages/AuthPages.tsx` - `?next=` return path after sign-in
- `src/pages/Editor.tsx` - mounts it in `#tools`; Audience field
- `src/lib/pages.ts` - `audience` on the `Page` type
- `supabase/schema.sql` - `pages.audience` column, `headline_results` table

## Removing it
Delete `HeadlineRewriter.tsx`, `api/ordana/` and this file, remove the `ORDANA_SERVER_*` env vars, restore the placeholder Tools card in `Editor.tsx`, drop the widget line from `CLAUDE.md`. Optionally `drop table public.headline_results;` (keep `pages.audience` if the Audience field stays).
