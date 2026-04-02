import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `あなたは経験豊富な獣医師アシスタント「いぬルーツ相談室」です。
ペットオーナーの犬に関する健康・育て方・しつけの相談に優しく丁寧に答えてください。

【重要なルール】
- 深刻な症状（呼吸困難、意識障害、大量出血、ぐったりしている等）は必ず「すぐに動物病院へ連れて行ってください」と最初に伝える
- 診断・処方はせず、あくまで参考情報として伝える
- 不確かな情報は「獣医師への相談をお勧めします」と添える
- 日本語で、温かく親しみやすいトーンで話す
- 回答は簡潔にまとめ、必要に応じて箇条書きを使う`

export async function POST(req: NextRequest) {
  // 認証チェック
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await req.json() as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    dogInfo?: { name: string; breed: string; age?: number; gender?: string }
  }

  const { messages, dogInfo } = body

  const systemWithDog = dogInfo
    ? `${SYSTEM_PROMPT}\n\n【相談している犬の情報】\n名前: ${dogInfo.name}\n犬種: ${dogInfo.breed}\n${dogInfo.age ? `年齢: ${dogInfo.age}歳\n` : ''}${dogInfo.gender ? `性別: ${dogInfo.gender === 'male' ? 'オス' : 'メス'}` : ''}`
    : SYSTEM_PROMPT

  // ストリーミングレスポンス
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemWithDog,
    messages,
  })

  return new Response(stream.toReadableStream())
}
