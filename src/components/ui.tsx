import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-accent text-white hover:opacity-90',
    secondary: 'bg-surface text-text border border-border hover:bg-background',
    danger: 'bg-surface text-red-600 border border-border hover:bg-red-50',
  }[variant]
  return (
    <button
      className={`inline-flex items-center justify-center rounded-token px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string }

export function Input({ label, className = '', id, ...props }: InputProps) {
  const field = (
    <input
      id={id}
      className={`w-full rounded-token border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent ${className}`}
      {...props}
    />
  )
  if (!label) return field
  return (
    <label className="block text-sm font-medium text-text">
      <span className="mb-1 block">{label}</span>
      {field}
    </label>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-token border border-border bg-surface p-5 ${className}`}>{children}</div>
  )
}
