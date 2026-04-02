import Anthropic from '@anthropic-ai/sdk'

/** Anthropic クライアント（シングルトン） */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/** ストリーミングレスポンスをReadableStreamに変換 */
export function streamToResponse(
  stream: ReturnType<typeof anthropic.messages.stream>,
): Response {
  return new Response(stream.toReadableStream())
}

/** システムプロンプト定数 */
export const SYSTEM_PROMPTS = {
  vetConsultant: `あなたは経験豊富な獣医師アシスタント「いぬルーツ相談室」です。
ペットオーナーの犬に関する健康・育て方・しつけの相談に優しく丁寧に答えてください。

【重要なルール】
- 深刻な症状（呼吸困難、意識障害、大量出血、ぐったりしている等）は必ず「すぐに動物病院へ連れて行ってください」と最初に伝える
- 診断・処方はせず、あくまで参考情報として伝える
- 不確かな情報は「獣医師への相談をお勧めします」と添える
- 日本語で、温かく親しみやすいトーンで話す`,

  recipeGenerator: `あなたは犬の栄養専門家です。安全で美味しい手作りドッグフードのレシピを提案してください。

【絶対守るルール】
- 犬に有害な食材（玉ねぎ・長ねぎ・ニラ、ぶどう・レーズン、チョコレート、キシリトール、マカダミアナッツ、アボカド）は絶対に使わない
- 塩分は最小限
- 材料は日本のスーパーで入手可能なものを使う`,
} as const
