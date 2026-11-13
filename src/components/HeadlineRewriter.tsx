import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Button } from './ui'

// CZ's "Headline rewriter" widget, embedded via Ordana. See ORDANA_INTEGRATION.md.
const EMBED_ORIGIN = 'https://headlinefix.vercel.app'

// Pagenest's design tokens (src/index.css), passed in so the widget matches the app.
// Change them here on a redesign. --font is a system stack, not a Google Font, so it is left out.
const EMBED_URL =
  `${EMBED_ORIGIN}/ordana-widget/embed?` +
  new URLSearchParams({
    key: 'wak_b26ff3430f044e84a7d27510a5b6eaae',
    mode: 'card',
    host: 'Pagenest',
    theme: 'light',
    accent: '4f46e5',
    accent_text: 'ffffff',
    bg: 'ffffff', // --surface: the widget sits inside Pagenest's card
    surface: 'f8fafc', // --background
    text: '0f172a',
    muted: '64748b',
    border: 'e2e8f0',
    radius: '8', // --radius: 0.5rem
    frame: 'none',
  }).toString()

const STYLES = ['benefit', 'question', 'punchy']

export type HeadlineResult = { chosen_headline: string; chosen_style: string | null }

type Props = {
  pageId: string
  headline: string
  audience: string
  onUseHeadline: (headline: string) => void
}

// Keep only the declared out keys, as short plain strings.
function validResult(fields: unknown): HeadlineResult | null {
  if (!fields || typeof fields !== 'object') return null
  const { chosen_headline, chosen_style } = fields as Record<string, unknown>
  if (typeof chosen_headline !== 'string' || !chosen_headline.trim()) return null
  return {
    chosen_headline: chosen_headline.trim().slice(0, 300),
    chosen_style: typeof chosen_style === 'string' && STYLES.includes(chosen_style) ? chosen_style : null,
  }
}

// Pagenest signs its own users in to the widget: a short-lived token from our server route, or null.
async function fetchWidgetToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return null
  const r = await fetch('/api/ordana/widget-token', {
    method: 'POST',
    headers: { Authorization: `Bearer ${data.session.access_token}` },
  })
  return r.ok ? ((await r.json()).token ?? null) : null
}

function postIdentity(frame: HTMLIFrameElement, token: string | null) {
  frame.contentWindow?.postMessage({ type: 'ordana-widget:identity', v: 1, token }, EMBED_ORIGIN)
}

export function HeadlineRewriter({ pageId, headline, audience, onUseHeadline }: Props) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const frameRef = useRef<HTMLIFrameElement>(null)
  const signinAsked = useRef(false)
  const [latest, setLatest] = useState<HeadlineResult | null>(null)

  const loginPath = `/login?next=${encodeURIComponent(location.pathname)}`
  const login = useRef(loginPath)
  login.current = loginPath

  // Fresh identity whenever the signed-in user changes (sign-in, sign-out, switch account).
  const userId = session?.user.id
  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !signinAsked.current) return
    fetchWidgetToken().then((token) => postIdentity(frame, token))
  }, [userId])

  // Latest values for the message listener, without re-subscribing on every keystroke.
  const ctx = useRef({ userId: session?.user.id, pageId, headline, audience })
  ctx.current = { userId: session?.user.id, pageId, headline, audience }

  useEffect(() => {
    supabase
      .from('headline_results')
      .select('chosen_headline, chosen_style')
      .eq('page_id', pageId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setLatest(data as HeadlineResult | null))
  }, [pageId])

  useEffect(() => {
    async function onMessage(e: MessageEvent) {
      const frame = frameRef.current
      if (!frame || e.source !== frame.contentWindow) return
      if (e.data?.type === 'ordana-widget:resize') {
        frame.style.height = `${e.data.height}px`
        return
      }
      if (e.origin !== EMBED_ORIGIN) return
      if (e.data?.type === 'ordana-widget:signin') {
        signinAsked.current = true
        const token = await fetchWidgetToken()
        if (!token && e.data.reason === 'needed') return navigate(login.current)
        return postIdentity(frame, token)
      }
      if (e.data?.v !== 1) return
      const { userId, pageId, headline, audience } = ctx.current
      if (e.data.type === 'ordana-widget:ready') {
        const fields = userId ? { draft_title: headline.trim(), audience: audience.trim() } : {}
        frame.contentWindow?.postMessage({ type: 'ordana-widget:context', v: 1, fields }, EMBED_ORIGIN)
      }
      if (e.data.type === 'ordana-widget:result' && userId) {
        const result = validResult(e.data.fields)
        if (!result) return
        setLatest(result)
        supabase.from('headline_results').insert({ ...result, user_id: userId, page_id: pageId }).then()
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="overflow-hidden rounded-token border border-border bg-surface">
      <h2 className="px-5 pt-5 font-bold">Tools</h2>
      <iframe
        ref={frameRef}
        src={EMBED_URL}
        title="Headline rewriter"
        style={{ width: '100%', height: 420, border: 0, display: 'block' }}
        loading="lazy"
        allow="clipboard-write"
      />
      {latest && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <div className="min-w-0 text-sm">
            <div className="text-muted">Last pick{latest.chosen_style && ` · ${latest.chosen_style}`}</div>
            <div className="font-medium break-words">{latest.chosen_headline}</div>
          </div>
          <Button variant="secondary" onClick={() => onUseHeadline(latest.chosen_headline)}>
            Use as headline
          </Button>
        </div>
      )}
    </div>
  )
}
