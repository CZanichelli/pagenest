import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Button, Card, Input } from '../components/ui'

export default function Settings() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState<string>(session?.user.user_metadata?.display_name ?? '')
  const [status, setStatus] = useState('')
  const [billing, setBilling] = useState<{ action: string; status: number; data: unknown } | null>(null)
  const [billingBusy, setBillingBusy] = useState(false)

  // Turn CZ's Headline rewriter on/off for this user via Ordana (test mode; no real checkout yet).
  async function callBilling(action: 'activate' | 'deactivate' | 'status') {
    setBillingBusy(true)
    const { data } = await supabase.auth.getSession()
    const r = await fetch('/api/ordana/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
      body: JSON.stringify({ action }),
    })
    setBilling({ action, status: r.status, data: await r.json().catch(() => null) })
    setBillingBusy(false)
  }

  useEffect(() => {
    callBilling('status')
  }, [])

  async function saveName() {
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName.trim() } })
    setStatus(error ? error.message : 'Saved')
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <Card className="space-y-4">
        <div>
          <div className="text-sm text-muted">Email</div>
          <div className="font-medium">{session?.user.email}</div>
        </div>
        <div className="space-y-2">
          <Input
            label="Display name"
            maxLength={80}
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value)
              setStatus('')
            }}
          />
          <p className="text-xs text-muted">Shown in tools you use inside Pagenest, like the Headline rewriter.</p>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={saveName}>Save name</Button>
            {status && <span className="text-sm text-muted">{status}</span>}
          </div>
        </div>
        <Button variant="danger" onClick={signOut}>Sign out</Button>
      </Card>

      <Card className="mt-6 space-y-4">
        <div>
          <h2 className="font-bold">Headline rewriter</h2>
          <p className="text-sm text-muted">Unlimited headline rewrites in the editor. Test mode: no payment is taken.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button disabled={billingBusy} onClick={() => callBilling('activate')}>Turn on Headline rewriter</Button>
          <Button variant="secondary" disabled={billingBusy} onClick={() => callBilling('deactivate')}>Turn off</Button>
        </div>
        {billing && (
          <div className="text-sm">
            <div className="text-muted">
              {billing.action} → HTTP {billing.status}
            </div>
            <pre className="mt-1 overflow-x-auto rounded-token border border-border bg-background p-3 text-xs">
              {JSON.stringify(billing.data, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  )
}
