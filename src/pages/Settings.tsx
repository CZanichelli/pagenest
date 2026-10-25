import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Button, Card } from '../components/ui'

export default function Settings() {
  const { session } = useAuth()
  const navigate = useNavigate()

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
        <Button variant="danger" onClick={signOut}>Sign out</Button>
      </Card>
    </div>
  )
}
