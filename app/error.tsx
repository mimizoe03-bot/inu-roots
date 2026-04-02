'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-background)' }}
    >
      <div
        className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'color-mix(in srgb, #c0614a 10%, transparent)', border: '1px solid color-mix(in srgb, #c0614a 30%, transparent)' }}
      >
        <AlertTriangle className="h-8 w-8" style={{ color: '#c0614a' }} />
      </div>

      <h1
        className="mb-3 text-2xl font-light"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
      >
        エラーが発生しました
      </h1>

      <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        申し訳ありません。予期しないエラーが発生しました。
      </p>

      <div className="flex gap-3">
        <button onClick={reset} className="btn-gold flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          再試行
        </button>
        <Link href="/dogs" className="btn-ghost">
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
