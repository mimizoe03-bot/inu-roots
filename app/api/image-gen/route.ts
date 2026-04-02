import Replicate from 'replicate'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: NextRequest) {
  // 認証チェック
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await req.json() as {
    dogId: string
    breed: string
    color: string
    name: string
  }

  const { dogId, breed, color, name } = body

  // 犬のオーナー確認
  const { data: dog } = await supabase
    .from('dogs')
    .select('owner_id')
    .eq('id', dogId)
    .single()

  if (!dog || dog.owner_id !== user.id) {
    return Response.json({ error: 'アクセス権がありません' }, { status: 403 })
  }

  try {
    // recraft-v3 で高品質な犬のイラスト生成
    const output = await replicate.run(
      'recraft-ai/recraft-v3' as `${string}/${string}`,
      {
        input: {
          prompt: `A charming ${breed} dog named ${name}, ${color} colored coat, professional pet portrait, soft natural lighting, pure white background, detailed watercolor illustration style, high quality, cute and friendly expression`,
          style: 'digital_illustration',
          width: 512,
          height: 512,
        },
      },
    )

    const imageUrl = Array.isArray(output) ? output[0] : String(output)

    // 生成画像をSupabase Storageに保存
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const path = `${user.id}/ai-portraits/${dogId}.webp`

    const { error: uploadError } = await supabase.storage
      .from('dog-photos')
      .upload(path, imageBuffer, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('dog-photos')
      .getPublicUrl(path)

    // 犬レコードのai_portrait_urlを更新
    await supabase
      .from('dogs')
      .update({ ai_portrait_url: publicUrl })
      .eq('id', dogId)

    return Response.json({ imageUrl: publicUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '画像生成に失敗しました'
    return Response.json({ error: message }, { status: 500 })
  }
}
