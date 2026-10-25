# Ordana integration: CZ — Headline rewriter

Pagenest embeds CZ's **Headline rewriter** widget (via Ordana) as an iframe. CZ serves the widget's UI, sign-in, payments and usage counting. Pagenest has no server code, database or secret for it. The `wak_...` key in the URL is public.

- **Where:** Editor (`/editor/:id`), Tools section `#tools`. Only signed-in users can open it (existing auth guard).
- **Mode:** `card`, inside Pagenest's `Card` with `frame=none`. Design tokens from `src/index.css` are passed as URL params.
- **Height:** set by the widget's `ordana-widget:resize` postMessage. Never give it a fixed height.

## Files
- `src/components/HeadlineRewriter.tsx`: the iframe, embed URL (key + design params) and resize listener
- `src/pages/Editor.tsx`: mounts `<HeadlineRewriter />` in `#tools`

## Rules
Don't rebuild the widget's screens, call `headlinefix.vercel.app/api/*`, overlay it, or hide its "by CZ" / "Made on Ordana" lines.

## Removing it
Delete `src/components/HeadlineRewriter.tsx`, then remove its import and the `<HeadlineRewriter />` card in `src/pages/Editor.tsx`. Remove the Ordana line from `CLAUDE.md` and delete this file.
