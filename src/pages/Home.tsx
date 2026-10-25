import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-text">Landing pages in a minute</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        PageNest lets you write a headline, pick a color and publish a simple landing page at a public link.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/signup" className="rounded-token bg-accent px-6 py-3 font-medium text-white hover:opacity-90">
          Get started
        </Link>
        <Link to="/login" className="rounded-token border border-border bg-surface px-6 py-3 font-medium text-text">
          Log in
        </Link>
      </div>
    </div>
  )
}
