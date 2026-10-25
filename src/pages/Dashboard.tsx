import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { makeSlug, type Page } from '../lib/pages'
import { Button, Card } from '../components/ui'

export default function Dashboard() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [pages, setPages] = useState<Page[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        setPages((data as Page[]) ?? [])
      })
  }, [])

  async function create() {
    if (!session) return
    const headline = 'Untitled page'
    const { data, error } = await supabase
      .from('pages')
      .insert({
        user_id: session.user.id,
        slug: makeSlug(headline),
        headline,
        subheadline: 'Tell visitors what you offer.',
        button_label: 'Learn more',
        button_url: 'https://example.com',
      })
      .select()
      .single()
    if (error) return setError(error.message)
    navigate(`/editor/${data.id}`)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your pages</h1>
        <Button onClick={create}>New page</Button>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {pages === null ? (
        <p className="text-muted">Loading…</p>
      ) : pages.length === 0 ? (
        <Card><p className="text-muted">No pages yet. Click "New page" to create one.</p></Card>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.headline || 'Untitled'}</div>
                <div className="text-sm text-muted">{p.published ? 'Published: yes' : 'Published: no'}</div>
              </div>
              <div className="flex gap-4 text-sm">
                <Link to={`/editor/${p.id}`} className="text-accent">Edit</Link>
                {p.published ? (
                  <Link to={`/p/${p.slug}`} target="_blank" className="text-accent">View</Link>
                ) : (
                  <span className="text-muted" title="Publish to view">View</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
