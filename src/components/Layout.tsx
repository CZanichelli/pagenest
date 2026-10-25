import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { configured } from '../lib/supabase'

export function AppShell() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-accent">PageNest</Link>
          <nav className="flex gap-4 text-sm text-muted">
            <Link to="/dashboard" className="hover:text-text">Dashboard</Link>
            <Link to="/settings" className="hover:text-text">Settings</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {!configured && (
          <p className="mb-4 rounded-token border border-border bg-surface p-3 text-sm text-red-600">
            Supabase is not configured. Create .env.local (see .env.example) and restart the dev server.
          </p>
        )}
        <Outlet />
      </main>
    </div>
  )
}

export function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) return <p className="p-8 text-muted">Loading…</p>
  if (!session) return <Navigate to="/login" replace />
  return <AppShell />
}
