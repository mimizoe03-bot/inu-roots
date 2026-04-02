import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, GitBranch } from 'lucide-react'
import Link from 'next/link'
import FamilyTree from '@/components/dogs/FamilyTree'
import ParentLinker from '@/components/dogs/ParentLinker'
import type { Dog } from '@/lib/supabase/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: dog } = await supabase.from('dogs').select('name').eq('id', id).single()
  return { title: dog ? `${dog.name}の家系図` : '家系図' }
}

async function getDogWithTree(dogId: string) {
  const supabase = await createClient()

  // 主役犬を取得
  const { data: dog } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', dogId)
    .single()

  if (!dog) return null

  // 親犬の関係を取得
  const { data: relationships } = await supabase
    .from('dog_relationships')
    .select('*, parent:parent_id(*)')
    .eq('child_id', dogId)

  // 親犬の祖父母を取得
  const parents: Record<string, unknown> = {}
  for (const rel of relationships ?? []) {
    const parent = rel.parent as { id: string } | null
    if (!parent) continue

    const { data: gpRelationships } = await supabase
      .from('dog_relationships')
      .select('*, parent:parent_id(*)')
      .eq('child_id', parent.id)

    const gpMap: Record<string, unknown> = {}
    for (const gpRel of gpRelationships ?? []) {
      gpMap[gpRel.role] = gpRel.parent
    }

    parents[rel.role] = { ...parent, ...gpMap }
  }

  return {
    ...dog,
    sire: parents['sire'] ?? null,
    dam: parents['dam'] ?? null,
  }
}

export default async function TreePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // アクセス権チェック
  const { data: { user } } = await supabase.auth.getUser()
  const { data: dog } = await supabase
    .from('dogs')
    .select('owner_id, is_public, name')
    .eq('id', id)
    .single()

  if (!dog) notFound()
  if (!dog.is_public && dog.owner_id !== user?.id) notFound()

  const dogWithTree = await getDogWithTree(id)
  if (!dogWithTree) notFound()

  // オーナーの場合のみ：紐付け用に全愛犬リストを取得
  let allDogs: Dog[] = []
  const isOwner = user?.id === dog.owner_id
  if (isOwner) {
    const { data } = await supabase
      .from('dogs')
      .select('*')
      .eq('owner_id', user!.id)
      .order('created_at', { ascending: false })
    allDogs = data ?? []
  }

  const sire = (dogWithTree.sire as Dog | null) ?? null
  const dam = (dogWithTree.dam as Dog | null) ?? null

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <Link
          href={`/dogs/${id}`}
          className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          プロフィールに戻る
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: 'color-mix(in srgb, var(--color-gold-400) 10%, transparent)', border: '1px solid var(--color-gold-700)' }}
          >
            <GitBranch className="h-5 w-5" style={{ color: 'var(--color-gold-400)' }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
              Family Tree
            </p>
            <h1
              className="text-2xl font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
            >
              {dog.name}の家系図
            </h1>
          </div>
        </div>
      </div>

      <div className="divider-gold mb-8" />

      {/* 家系図 */}
      {/* @ts-expect-error -- FamilyTreeDog 型の祖父母フィールドを含む */}
      <FamilyTree dog={dogWithTree} />

      {/* 操作ヒント */}
      <p className="mt-4 mb-8 text-center text-xs" style={{ color: 'var(--color-text-subtle)' }}>
        ドラッグでパン・ スクロールでズーム・ ノードをクリックでプロフィールへ
      </p>

      {/* オーナーのみ：親犬紐付けUI */}
      {isOwner && (
        <ParentLinker
          dogId={id}
          currentSire={sire}
          currentDam={dam}
          allDogs={allDogs}
        />
      )}
    </div>
  )
}
