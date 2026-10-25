import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Page } from '../lib/pages'
import { PagePreview } from '../components/PagePreview'

export default function PublicPage() {
  const { slug } = useParams()
  const [page, setPage] = useState<Page | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPage(data as Page)
          document.title = (data as Page).headline || 'PageNest'
        } else setMissing(true)
      })
  }, [slug])

  if (page) {
    return (
      <div className="min-h-screen bg-surface">
        <PagePreview {...page} />
      </div>
    )
  }
  return (
    <p className="p-8 text-center text-muted">
      {missing ? 'This page does not exist or is not published.' : 'Loading…'}
    </p>
  )
}
