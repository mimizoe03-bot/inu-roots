import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  // 認証チェック
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await req.json() as {
    breed: string
    size: 'small' | 'medium' | 'large'
    age: 'puppy' | 'adult' | 'senior'
    allergies: string
    goal: string
  }

  const { breed, size, age, allergies, goal } = body

  const sizeLabel = { small: '小型犬', medium: '中型犬', large: '大型犬' }[size]
  const ageLabel = { puppy: '子犬（1歳未満）', adult: '成犬（1〜7歳）', senior: 'シニア犬（7歳以上）' }[age]

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `あなたは犬の栄養専門家です。安全で美味しい手作りドッグフードのレシピを提案してください。

【絶対守るルール】
- 犬に有害な食材（玉ねぎ・長ねぎ・ニラ、ぶどう・レーズン、チョコレート・カカオ、キシリトール、マカダミアナッツ、アボカド、生のにんにく）は絶対に使わない
- 塩分は最小限に抑える
- 材料は日本のスーパーで入手可能なものを使う
- 栄養バランスを考慮する

以下のJSON形式で、レシピを3品返してください。コードブロックなしで純粋なJSONのみ返すこと：
{
  "recipes": [
    {
      "title": "レシピ名",
      "description": "一言説明",
      "ingredients": [{"name": "材料名", "amount": "量", "unit": "単位"}],
      "steps": [{"order": 1, "text": "手順"}],
      "nutrition_notes": "栄養メモ",
      "caution": "注意事項（アレルギー等）"
    }
  ]
}`,
    messages: [{
      role: 'user',
      content: `犬種: ${breed}
サイズ: ${sizeLabel}
年齢: ${ageLabel}
アレルギー・苦手な食材: ${allergies || 'なし'}
目的・悩み: ${goal}

このわんちゃん向けの手作りドッグフードレシピを3品提案してください。`,
    }],
  })

  return new Response(stream.toReadableStream())
}
