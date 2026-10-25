import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Button, Card, Input } from '../components/ui'

function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/dashboard" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const creds = { email, password }
    const { data, error } =
      mode === 'login' ? await supabase.auth.signInWithPassword(creds) : await supabase.auth.signUp(creds)
    setBusy(false)
    if (error) return setError(error.message)
    if (data.session) navigate('/dashboard')
    else setError('Check your email to confirm your account, then log in.')
  }

  const isLogin = mode === 'login'
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-4 text-xl font-bold">{isLogin ? 'Log in' : 'Create your account'}</h1>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted">
          {isLogin ? (
            <>No account? <Link to="/signup" className="text-accent">Sign up</Link></>
          ) : (
            <>Already have an account? <Link to="/login" className="text-accent">Log in</Link></>
          )}
        </p>
      </Card>
    </div>
  )
}

export const Login = () => <AuthForm mode="login" />
export const Signup = () => <AuthForm mode="signup" />
