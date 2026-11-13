// Vercel function: signs a short-lived identity token for CZ's Headline rewriter
// widget (via Ordana), for the currently signed-in Pagenest user only.
// See ORDANA_INTEGRATION.md. Needs ORDANA_SERVER_KEY_ID and ORDANA_SERVER_SECRET
// in the server environment (never in browser code or a commit).
import { createHmac, randomUUID } from 'node:crypto'

const WIDGET_KEY = 'wak_b26ff3430f044e84a7d27510a5b6eaae'

const b64url = (s: string | Buffer) => Buffer.from(s).toString('base64url')

export function signWidgetToken(sub: string, name: string | undefined, kid: string, secret: string) {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT', kid }))
  const claims: Record<string, string | number> = { aud: WIDGET_KEY, sub, iat: now, exp: now + 120, jti: randomUUID() }
  if (name) claims.name = name
  const body = `${header}.${b64url(JSON.stringify(claims))}`
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`
}

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

export async function POST(request: Request) {
  const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ORDANA_SERVER_KEY_ID, ORDANA_SERVER_SECRET } = process.env
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY || !ORDANA_SERVER_KEY_ID || !ORDANA_SERVER_SECRET) {
    return json(500, { error: 'not configured' })
  }

  // The browser sends its Supabase access token; Supabase tells us whose it is.
  const auth = request.headers.get('authorization') ?? ''
  if (!/^Bearer \S+$/.test(auth)) return json(401, { error: 'not signed in' })
  const res = await fetch(`${VITE_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: VITE_SUPABASE_ANON_KEY, Authorization: auth },
  })
  if (!res.ok) return json(401, { error: 'not signed in' })
  const user = (await res.json()) as { id?: string; user_metadata?: { display_name?: unknown } }
  if (!user.id) return json(401, { error: 'not signed in' })

  // Name only (never the email): the display name the user set in Pagenest's Settings, if any.
  const name =
    typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name.trim().slice(0, 80) : ''
  return json(200, { token: signWidgetToken(user.id, name || undefined, ORDANA_SERVER_KEY_ID, ORDANA_SERVER_SECRET) })
}
