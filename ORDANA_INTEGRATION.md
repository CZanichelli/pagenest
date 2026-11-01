# Ordana integration: CZ's "Headline rewriter"

Pagenest embeds CZ's **Headline rewriter** widget (via Ordana) in the editor's Tools section (`/editor/:id`, `#tools`), in card mode, for signed-in users.
The widget's screens, sign-in, payments and usage counting all run inside CZ's iframe (`https://headlinefix.vercel.app/ordana-widget/embed`). Don't rebuild them or call CZ's routes.

## Shared context
- Sends (on every `ordana-widget:ready`): `draft_title` = the page's Headline field, `audience` = the page's Audience field (`pages.audience`). `{}` when signed out.
- Receives (`ordana-widget:result`, after the user agrees in the widget): `chosen_headline`, `chosen_style`. Validated and stored in `headline_results` (keyed by Pagenest's user id and page id, owner-only RLS). The latest one is shown under the widget with a "Use as headline" button.

## Files
- `src/components/HeadlineRewriter.tsx` - iframe, embed URL with design tokens, resize/context/result listeners, latest-result panel
- `src/pages/Editor.tsx` - mounts it in `#tools`; Audience field
- `src/lib/pages.ts` - `audience` on the `Page` type
- `supabase/schema.sql` - `pages.audience` column, `headline_results` table

## Removing it
Delete `HeadlineRewriter.tsx` and this file, restore the placeholder Tools card in `Editor.tsx`, drop the widget line from `CLAUDE.md`. Optionally `drop table public.headline_results;` (keep `pages.audience` if the Audience field stays).
