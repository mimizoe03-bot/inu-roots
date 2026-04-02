import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, TrendingUp, PawPrint } from 'lucide-react'
import { BREEDS } from '@/lib/utils'

export const metadata = { title: 'コミュニティ' }

/* 犬種ごとの投稿数を取得（簡易版） */
async function getBreedCounts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('breed')
    .limit(1000)

  if (!data) return {} as Record<string, number>

  return data.reduce<Record<string, number>>((acc, { breed }) => {
    acc[breed] = (acc[breed] ?? 0) + 1
    return acc
  }, {})
}

export default async function CommunityPage() {
  const breedCounts = await getBreedCounts()

  // 投稿数でソート
  const sortedBreeds = BREEDS.filter((b) => b !== 'その他').sort(
    (a, b) => (breedCounts[b] ?? 0) - (breedCounts[a] ?? 0),
  )

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
          Community
        </p>
        <h1
          className="mb-2 text-3xl font-light"
          style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
        >
          犬種別コミュニティ
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          同じ犬種の仲間と情報交換・写真シェアを楽しんで。
        </p>
      </div>

      <div className="divider-gold mb-8" />

      {/* 人気コミュニティ */}
      {Object.keys(breedCounts).length > 0 && (
        <div className="mb-8">
          <h2
            className="mb-4 flex items-center gap-2 text-lg font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)' }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-gold-500)' }} />
            人気コミュニティ
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(breedCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([breed, count]) => (
                <Link
                  key={breed}
                  href={`/community/${encodeURIComponent(breed)}`}
                  className="flex items-center gap-2 rounded-full px-4 py-2 transition-all"
                  style={{
                    background: 'color-mix(in srgb, var(--color-gold-400) 10%, transparent)',
                    border: '1px solid var(--color-gold-700)',
                    color: 'var(--color-gold-300)',
                  }}
                >
                  <span className="text-sm">{breed}</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-xs"
                    style={{ background: 'var(--color-gold-700)', color: 'var(--color-ink-950)' }}
                  >
                    {count}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* 全犬種リスト */}
      <h2
        className="mb-4 flex items-center gap-2 text-lg font-light"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)' }}
      >
        <Users className="h-4 w-4" style={{ color: 'var(--color-gold-500)' }} />
        すべての犬種
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedBreeds.map((breed) => {
          const count = breedCounts[breed] ?? 0
          return (
            <Link
              key={breed}
              href={`/community/${encodeURIComponent(breed)}`}
              className="card-luxury group flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                  style={{ background: 'color-mix(in srgb, var(--color-gold-400) 8%, transparent)' }}
                >
                  <PawPrint className="h-4 w-4" style={{ color: 'var(--color-gold-600)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-cream-200)' }}>
                  {breed}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                  >
                    {count}件
                  </span>
                )}
                <span className="text-xs transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--color-text-subtle)' }}>→</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
