import { PawPrint } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-full min-h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-gold-500)' }}
          />
          <PawPrint
            className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-gold-600)' }}
          />
        </div>
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>
          Loading...
        </p>
      </div>
    </div>
  )
}
