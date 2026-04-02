import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind クラスのマージユーティリティ */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 生年月日から年齢を計算 */
export function calcAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()

  if (years === 0) {
    const m = months < 0 ? months + 12 : months
    return `${m}ヶ月`
  }
  return `${years}歳${months < 0 ? years - 1 : years}ヶ月`.replace(/(\d+)歳\d+/, '$1歳')
}

/** 犬の性別を日本語に変換 */
export function formatGender(gender: 'male' | 'female' | null): string {
  if (gender === 'male') return 'オス'
  if (gender === 'female') return 'メス'
  return '不明'
}

/** 画像ファイルバリデーション（最大5MB、jpg/png/webpのみ） */
export function validateImageFile(file: File): string | null {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'jpg・png・webp 形式の画像のみアップロードできます'
  }
  if (file.size > MAX_SIZE) {
    return '画像サイズは5MB以下にしてください'
  }
  return null
}

/** 都道府県一覧 */
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
] as const

/** 主要犬種一覧（JKC登録犬種から抜粋） */
export const BREEDS = [
  'チワワ', 'ポメラニアン', 'トイプードル', 'ミニチュアダックスフンド',
  'ヨークシャーテリア', 'マルチーズ', 'シーズー', 'パピヨン',
  'ミニチュアシュナウザー', 'フレンチブルドッグ', 'パグ', 'ボストンテリア',
  'ビーグル', 'コーギー', 'シェルティ', 'ボーダーコリー',
  'ゴールデンレトリーバー', 'ラブラドールレトリーバー', 'シベリアンハスキー',
  'サモエド', 'アキタ', '柴犬', '紀州犬', '甲斐犬', '北海道犬', '四国犬',
  'その他',
] as const

export type Breed = typeof BREEDS[number]
