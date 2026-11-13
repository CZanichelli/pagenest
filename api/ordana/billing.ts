// Vercel function: turns CZ's Headline rewriter (via Ordana) on/off for the
// currently signed-in Pagenest user, or reads their status. See ORDANA_INTEGRATION.md.
// TEST MODE ONLY: every call sends "livemode": false, so no real money moves.
import { createHmac } from 'node:crypto'

const BILLING_URL = 'https://acwpajdwtaltiwnecszq.supabase.co/functions/v1/widget-host-billing'
const ACTIONS = ['activate', 'deactivate', 'status'] as const
export type BillingAction = (typeof ACTIONS)[number]

// Signed call to Ordana's widget-host-billing. hostUserId is the same id as the widget token's sub.
export async function callOrdanaBilling(action: BillingAction, hostUserId: string, keyId: string, secret: string) {
  const body = JSON.stringify({ action, host_user_id: hostUserId, livemode: false })
  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  const res = await fetch(BILLING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Ordana-Key': keyId,
      'X-Ordana-Timestamp': timestamp,
      'X-Ordana-Signature': `sha256=${signature}`,
    },
    body,
  })
  const text = await res.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    data = { raw: text }
  }
  return { status: res.status, data }
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

  const auth = request.headers.get('authorization') ?? ''
  if (!/^Bearer \S+$/.test(auth)) return json(401, { error: 'not signed in' })
  const res = await fetch(`${VITE_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: VITE_SUPABASE_ANON_KEY, Authorization: auth },
  })
  if (!res.ok) return json(401, { error: 'not signed in' })
  const user = (await res.json()) as { id?: string }
  if (!user.id) return json(401, { error: 'not signed in' })

  const { action } = ((await request.json().catch(() => ({}))) ?? {}) as { action?: unknown }
  if (!ACTIONS.includes(action as BillingAction)) return json(400, { error: 'unknown action' })

  const reply = await callOrdanaBilling(action as BillingAction, user.id, ORDANA_SERVER_KEY_ID, ORDANA_SERVER_SECRET)
  return json(reply.status, reply.data)
}
