import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Button, Card, Input } from '../components/ui'

export default function Settings() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState<string>(session?.user.user_metadata?.display_name ?? '')
  const [status, setStatus] = useState('')

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
    </div>
  )
}
