import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

/** 親犬の紐付け・削除 API */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '認証が必要です' }, { status: 401 })

  const body = await req.json() as {
    childId: string
    parentId: string
    role: 'sire' | 'dam'
  }

  const { childId, parentId, role } = body

  // 子犬のオーナー確認
  const { data: child } = await supabase
    .from('dogs')
    .select('owner_id')
    .eq('id', childId)
    .single()

  if (!child || child.owner_id !== user.id) {
    return Response.json({ error: 'アクセス権がありません' }, { status: 403 })
  }

  // 既存の関係を削除してから挿入（upsert）
  await supabase
    .from('dog_relationships')
    .delete()
    .eq('child_id', childId)
    .eq('role', role)

  const { error } = await supabase
    .from('dog_relationships')
    .insert({ child_id: childId, parent_id: parentId, role })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '認証が必要です' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get('childId')
  const role = searchParams.get('role') as 'sire' | 'dam' | null

  if (!childId || !role) return Response.json({ error: 'パラメーターが不足しています' }, { status: 400 })

  // オーナー確認
  const { data: child } = await supabase.from('dogs').select('owner_id').eq('id', childId).single()
  if (!child || child.owner_id !== user.id) {
    return Response.json({ error: 'アクセス権がありません' }, { status: 403 })
  }

  const { error } = await supabase
    .from('dog_relationships')
    .delete()
    .eq('child_id', childId)
    .eq('role', role)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
