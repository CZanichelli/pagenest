export type Page = {
  id: string
  user_id: string
  slug: string
  headline: string | null
  subheadline: string | null
  button_label: string | null
  button_url: string | null
  accent: string | null
  published: boolean | null
  created_at: string
  updated_at: string
}

export function makeSlug(headline: string): string {
  const base = headline
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '')
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${base || 'page'}-${suffix}`
}

// Only allow http(s)/mailto links so a stored value can't be a javascript: URL.
export function safeUrl(url: string | null): string {
  const u = (url ?? '').trim()
  if (!u) return '#'
  if (/^(https?:|mailto:)/i.test(u)) return u
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return '#'
  return `https://${u}`
}
