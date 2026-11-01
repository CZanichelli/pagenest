import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Page } from '../lib/pages'
import { Button, Card, Input } from '../components/ui'
import { PagePreview } from '../components/PagePreview'
import { HeadlineRewriter } from '../components/HeadlineRewriter'

export default function Editor() {
  const { id } = useParams()
  const [page, setPage] = useState<Page | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else if (!data) setError('Page not found.')
        else setPage(data as Page)
      })
  }, [id])

  if (!page) return error ? <p className="text-red-600">{error}</p> : <p className="text-muted">Loading…</p>

  const set = (patch: Partial<Page>) => {
    setPage({ ...page, ...patch })
    setStatus('')
  }

  async function save(published: boolean | null) {
    if (!page) return
    setBusy(true)
    setError('')
    const { error } = await supabase
      .from('pages')
      .update({
        headline: page.headline,
        subheadline: page.subheadline,
        audience: page.audience,
        button_label: page.button_label,
        button_url: page.button_url,
        accent: page.accent,
        published,
      })
      .eq('id', page.id)
    setBusy(false)
    if (error) return setError(error.message)
    setPage({ ...page, published })
    setStatus('Saved')
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/dashboard" className="text-sm text-muted">← Back to dashboard</Link>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-red-600">{error}</span>}
          {status && <span className="text-sm text-muted">{status}</span>}
          {page.published && (
            <Link to={`/p/${page.slug}`} target="_blank" className="text-sm text-accent">View public page</Link>
          )}
          <Button variant="secondary" disabled={busy} onClick={() => save(!page.published)}>
            {page.published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button disabled={busy} onClick={() => save(page.published)}>Save</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="space-y-4">
            <Input label="Headline" value={page.headline ?? ''} onChange={(e) => set({ headline: e.target.value })} />
            <Input
              label="Subheadline"
              value={page.subheadline ?? ''}
              onChange={(e) => set({ subheadline: e.target.value })}
            />
            <Input
              label="Audience"
              placeholder="Who is this page for?"
              value={page.audience ?? ''}
              onChange={(e) => set({ audience: e.target.value })}
            />
            <Input
              label="Button label"
              value={page.button_label ?? ''}
              onChange={(e) => set({ button_label: e.target.value })}
            />
            <Input
              label="Button link"
              value={page.button_url ?? ''}
              onChange={(e) => set({ button_url: e.target.value })}
            />
            <label className="block text-sm font-medium">
              <span className="mb-1 block">Accent color</span>
              <input
                type="color"
                value={page.accent ?? '#4f46e5'}
                onChange={(e) => set({ accent: e.target.value })}
                className="h-10 w-20 cursor-pointer rounded-token border border-border bg-surface"
              />
            </label>
          </Card>

          {/* TOOLS: CZ's Headline rewriter via Ordana, see ORDANA_INTEGRATION.md. */}
          <section id="tools" data-slot="tools">
            <HeadlineRewriter
              pageId={page.id}
              headline={page.headline ?? ''}
              audience={page.audience ?? ''}
              onUseHeadline={(headline) => set({ headline })}
            />
          </section>
        </div>

        <div className="overflow-hidden rounded-token border border-border bg-surface">
          <PagePreview {...page} />
        </div>
      </div>
    </div>
  )
}
