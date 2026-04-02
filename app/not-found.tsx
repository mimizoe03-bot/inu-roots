'use client'

import Link from 'next/link'
import { PawPrint, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-background)' }}
    >
      {/* 背景装飾 */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--color-gold-800) 6%, transparent), transparent)',
        }}
      />

      <div className="relative z-10">
        {/* アイコン */}
        <div
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: 'color-mix(in srgb, var(--color-gold-400) 8%, transparent)',
            border: '1px solid var(--color-gold-800)',
          }}
        >
          <PawPrint className="h-10 w-10" style={{ color: 'var(--color-gold-600)' }} />
        </div>

        {/* 404 */}
        <p
          className="mb-2 text-8xl font-light tracking-tighter"
          style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-gold-800)' }}
        >
          404
        </p>

        <h1
          className="mb-4 text-2xl font-light"
          style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
        >
          ページが見つかりません
        </h1>

        <p className="mb-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          お探しのページは存在しないか、移動した可能性があります。
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/dogs" className="btn-gold flex items-center gap-2">
            ダッシュボードへ
          </Link>
          <button
            onClick={() => history.back()}
            className="btn-ghost flex items-center gap-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            前のページに戻る
          </button>
        </div>
      </div>
    </div>
  )
}
