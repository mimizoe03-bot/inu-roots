import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, GitBranch, Calendar, Palette, PawPrint,
  Edit, Sparkles, MessageCircle, Share2, Lock,
} from 'lucide-react'
import { formatGender } from '@/lib/utils'
import AIPortraitButton from '@/components/dogs/AIPortraitButton'
import type { Dog } from '@/lib/supabase/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: rawData } = await supabase.from('dogs').select('name, breed').eq('id', id).single()
  const data = rawData as Pick<Dog, 'name' | 'breed'> | null
  return { title: data ? `${data.name} — ${data.breed}` : '愛犬プロフィール' }
}

export default async function DogProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 犬の情報を取得
  const { data: rawDog } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', id)
    .single()
  const dog = rawDog as Dog | null

  if (!dog) notFound()
  if (!dog.is_public && dog.owner_id !== user?.id) notFound()

  // 血統書情報を取得
  const { data: pedigree } = await supabase
    .from('pedigree_records')
    .select('*')
    .eq('dog_id', id)
    .single()

  // 親犬情報を取得
  const { data: relationships } = await supabase
    .from('dog_relationships')
    .select('*, parent:parent_id(id, name, breed, photo_url, ai_portrait_url, gender)')
    .eq('child_id', id)

  const sire = relationships?.find((r) => r.role === 'sire')?.parent as {
    id: string; name: string; breed: string; photo_url: string | null;
    ai_portrait_url: string | null; gender: string | null
  } | undefined
  const dam = relationships?.find((r) => r.role === 'dam')?.parent as typeof sire | undefined

  const isOwner = user?.id === dog.owner_id

  const age = dog.birth_date
    ? Math.floor((Date.now() - new Date(dog.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null

  return (
    <div className="mx-auto max-w-3xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link
          href="/dogs"
          className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          一覧に戻る
        </Link>
      </div>

      {/* メインカード */}
      <div className="card-luxury overflow-hidden">
        {/* 写真ヘッダー */}
        <div
          className="relative h-56 w-full overflow-hidden"
          style={{ background: 'var(--color-surface-2)' }}
        >
          {dog.ai_portrait_url || dog.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dog.ai_portrait_url ?? dog.photo_url ?? ''}
              alt={dog.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <PawPrint className="h-16 w-16 opacity-10" style={{ color: 'var(--color-gold-400)' }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>
                No Photo
              </span>
            </div>
          )}

          {/* 非公開バッジ */}
          {!dog.is_public && (
            <div className="absolute left-4 top-4">
              <span className="badge-gold flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" />
                非公開
              </span>
            </div>
          )}

          {/* オーナー操作ボタン */}
          {isOwner && (
            <div className="absolute right-4 top-4 flex gap-2">
              <AIPortraitButton dogId={dog.id} breed={dog.breed} color={dog.color ?? ''} name={dog.name} />
              <Link
                href={`/dogs/${dog.id}/edit`}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
              >
                <Edit className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* 基本情報 */}
        <div className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1
                className="mb-1 text-3xl font-light"
                style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
              >
                {dog.name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {dog.breed}
              </p>
            </div>
            {/* シェアボタン */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
              title="シェア"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <div className="divider-gold mb-6" />

          {/* 詳細情報グリッド */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                icon: PawPrint,
                label: '性別',
                value: formatGender(dog.gender as 'male' | 'female' | null),
                color: dog.gender === 'male' ? '#4a8fa8' : dog.gender === 'female' ? '#c0614a' : undefined,
              },
              {
                icon: Calendar,
                label: '年齢',
                value: age !== null ? `${age}歳` : '不明',
                color: undefined,
              },
              {
                icon: Palette,
                label: '毛色',
                value: dog.color ?? '未記入',
                color: undefined,
              },
              {
                icon: Calendar,
                label: '誕生日',
                value: dog.birth_date
                  ? new Date(dog.birth_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '不明',
                color: undefined,
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="rounded-lg p-3 text-center"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <Icon className="mx-auto mb-1 h-4 w-4" style={{ color: 'var(--color-gold-600)' }} />
                <p className="mb-0.5 text-xs" style={{ color: 'var(--color-text-subtle)' }}>{label}</p>
                <p className="text-sm font-medium" style={{ color: color ?? 'var(--color-cream-200)' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Link
              href={`/dogs/${dog.id}/tree`}
              className="btn-gold flex flex-1 items-center justify-center gap-2"
            >
              <GitBranch className="h-3.5 w-3.5" />
              家系図を見る
            </Link>
            <Link
              href={`/chat?dogId=${dog.id}`}
              className="btn-ghost flex flex-1 items-center justify-center gap-2"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              相談する
            </Link>
          </div>
        </div>
      </div>

      {/* 血統書情報 */}
      {pedigree && (pedigree.registration_no || pedigree.registered_name || pedigree.registration_org) && (
        <div className="card-luxury mt-4 p-6">
          <h2
            className="mb-4 flex items-center gap-2 text-lg font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            <Sparkles className="h-4 w-4" style={{ color: 'var(--color-gold-500)' }} />
            血統書情報
          </h2>
          <dl className="space-y-3">
            {[
              { label: '登録団体', value: pedigree.registration_org },
              { label: '登録番号', value: pedigree.registration_no },
              { label: '登録名', value: pedigree.registered_name },
            ]
              .filter(({ value }) => !!value)
              .map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <dt className="w-24 flex-shrink-0 text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-subtle)' }}>
                    {label}
                  </dt>
                  <dd className="text-sm" style={{ color: 'var(--color-cream-200)' }}>{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {/* 親犬情報 */}
      {(sire || dam) && (
        <div className="card-luxury mt-4 p-6">
          <h2
            className="mb-4 text-lg font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            親犬
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { dog: sire, label: '父', color: '#3b6ea0' },
              { dog: dam, label: '母', color: '#a05b72' },
            ]
              .filter(({ dog }) => !!dog)
              .map(({ dog: parent, label, color }) => (
                <Link
                  key={label}
                  href={`/dogs/${parent!.id}`}
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors"
                  style={{ background: `color-mix(in srgb, ${color} 6%, transparent)`, border: `1px solid ${color}30` }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{ border: `1.5px solid ${color}60` }}
                  >
                    {parent!.ai_portrait_url || parent!.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={parent!.ai_portrait_url ?? parent!.photo_url ?? ''}
                        alt={parent!.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PawPrint className="h-4 w-4" style={{ color, opacity: 0.6 }} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide" style={{ color }}>
                      {label}
                    </p>
                    <p className="font-medium" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)', fontSize: '1rem' }}>
                      {parent!.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{parent!.breed}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
