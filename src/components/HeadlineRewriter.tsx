import { useEffect, useRef } from 'react'

// CZ's "Headline rewriter" widget, embedded via Ordana. See ORDANA_INTEGRATION.md.
// Colours/radius mirror the design tokens in src/index.css; change them here on a redesign.
const EMBED_URL =
  'https://headlinefix.vercel.app/ordana-widget/embed?' +
  new URLSearchParams({
    key: 'wak_4e925a1c40144ca4af4102a76de11b3a',
    mode: 'card',
    host: 'Pagenest',
    frame: 'none',
    theme: 'light',
    accent: '4f46e5',
    accent_text: 'ffffff',
    bg: 'ffffff', // --surface: the widget sits inside Pagenest's Card
    surface: 'ffffff',
    text: '0f172a',
    muted: '64748b',
    border: 'e2e8f0',
    radius: '8',
  })

export function HeadlineRewriter() {
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== 'ordana-widget:resize') return
      if (ref.current && ref.current.contentWindow === e.source) ref.current.style.height = e.data.height + 'px'
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <iframe
      ref={ref}
      src={EMBED_URL}
      title="Headline rewriter"
      style={{ width: '100%', height: 420, border: 0, display: 'block' }}
      loading="lazy"
      allow="clipboard-write"
    />
  )
}
