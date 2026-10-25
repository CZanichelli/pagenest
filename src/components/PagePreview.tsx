import { safeUrl, type Page } from '../lib/pages'

type Props = Pick<Page, 'headline' | 'subheadline' | 'button_label' | 'button_url' | 'accent'>

// Used by both the editor preview and the public /p/:slug page.
export function PagePreview({ headline, subheadline, button_label, button_url, accent }: Props) {
  const color = accent || '#4f46e5'
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight" style={{ color }}>
        {headline || 'Your headline'}
      </h1>
      {subheadline && <p className="mt-4 max-w-xl text-lg text-muted">{subheadline}</p>}
      {button_label && (
        <a
          href={safeUrl(button_url)}
          className="mt-8 rounded-token px-6 py-3 font-medium text-white"
          style={{ background: color }}
        >
          {button_label}
        </a>
      )}
    </div>
  )
}
