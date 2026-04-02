import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, PawPrint, GitBranch, Calendar } from 'lucide-react'
import { formatGender } from '@/lib/utils'
import type { Dog } from '@/lib/supabase/types'

export const metadata = { title: '愛犬一覧' }

function DogCard({ dog }: { dog: Dog }) {
  const age = dog.birth_date
    ? Math.floor((Date.now() - new Date(dog.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null

  return (
    <Link href={`/dogs/${dog.id}`} className="card-luxury group block overflow-hidden">
      {/* 画像エリア */}
      <div
        className="relative h-40 w-full overflow-hidden"
        style={{ background: 'var(--color-surface-2)' }}
      >
        {dog.ai_portrait_url || dog.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dog.ai_portrait_url ?? dog.photo_url ?? ''}
            alt={dog.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PawPrint className="h-12 w-12 opacity-20" style={{ color: 'var(--color-gold-500)' }} />
          </div>
        )}

        {/* 公開バッジ */}
        {!dog.is_public && (
          <div className="absolute right-2 top-2">
            <span className="badge-gold">非公開</span>
          </div>
        )}
      </div>

      {/* 情報 */}
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3
            className="text-lg font-medium leading-tight"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            {dog.name}
          </h3>
          <span
            className="flex-shrink-0 text-xs"
            style={{ color: dog.gender === 'male' ? '#4a8fa8' : '#c0614a' }}
          >
            {formatGender(dog.gender)}
          </span>
        </div>

        <p className="mb-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {dog.breed}
        </p>

        <div className="flex items-center gap-4">
          {age !== null && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
              <Calendar className="h-3 w-3" />
              {age}歳
            </div>
          )}
          <Link
            href={`/dogs/${dog.id}/tree`}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: 'var(--color-text-subtle)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <GitBranch className="h-3 w-3" />
            家系図
          </Link>
        </div>
      </div>
    </Link>
  )
}

export default async function DogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: dogs } = await supabase
    .from('dogs')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
            My Dogs
          </p>
          <h1
            className="text-3xl font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            愛犬一覧
          </h1>
        </div>
        <Link href="/dogs/new" className="btn-gold flex items-center gap-2">
          <Plus className="h-3.5 w-3.5" />
          追加
        </Link>
      </div>

      <div className="divider-gold mb-8" />

      {/* 愛犬グリッド */}
      {!dogs || dogs.length === 0 ? (
        <div className="card-luxury flex flex-col items-center justify-center py-20 text-center">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'color-mix(in srgb, var(--color-gold-400) 8%, transparent)' }}
          >
            <PawPrint className="h-10 w-10" style={{ color: 'var(--color-gold-600)' }} />
          </div>
          <h2
            className="mb-3 text-2xl font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)' }}
          >
            まだ愛犬が登録されていません
          </h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            最初の愛犬を追加して、家系図を始めましょう。
          </p>
          <Link href="/dogs/new" className="btn-gold flex items-center gap-2">
            <Plus className="h-3.5 w-3.5" />
            愛犬を追加する
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      )}
    </div>
  )
}
