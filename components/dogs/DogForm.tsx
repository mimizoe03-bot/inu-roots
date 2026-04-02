'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Upload, X, ChevronDown, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BREEDS, PREFECTURES, validateImageFile } from '@/lib/utils'
import { toast } from 'sonner'

interface FormValues {
  name: string
  breed: string
  breed_en: string
  gender: 'male' | 'female' | ''
  birth_date: string
  color: string
  is_public: boolean
  // 血統書
  registration_no: string
  registration_org: string
  registered_name: string
  // 親犬（名前のみ入力）
  sire_name: string
  dam_name: string
}

const ORG_OPTIONS = ['JKC（ジャパンケネルクラブ）', 'AKC', 'FCI', 'UKC', 'その他']

export default function DogForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1:基本情報 2:血統書 3:親犬

  const [form, setForm] = useState<FormValues>({
    name: '',
    breed: '',
    breed_en: '',
    gender: '',
    birth_date: '',
    color: '',
    is_public: true,
    registration_no: '',
    registration_org: '',
    registered_name: '',
    sire_name: '',
    dam_name: '',
  })

  const update = (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateImageFile(file)
    if (error) { toast.error(error); return }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.breed) {
      toast.error('名前と犬種は必須です')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      // 写真アップロード
      let photoUrl: string | null = null
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('dog-photos')
          .upload(path, photoFile)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('dog-photos')
          .getPublicUrl(path)
        photoUrl = publicUrl
      }

      // 犬の基本情報を保存
      const { data: dog, error: dogError } = await supabase
        .from('dogs')
        .insert({
          owner_id: user.id,
          name: form.name,
          breed: form.breed,
          breed_en: form.breed_en || null,
          gender: form.gender || null,
          birth_date: form.birth_date || null,
          color: form.color || null,
          photo_url: photoUrl,
          is_public: form.is_public,
        })
        .select()
        .single()

      if (dogError) throw dogError

      // 血統書情報を保存
      if (form.registration_no || form.registration_org || form.registered_name) {
        await supabase
          .from('pedigree_records')
          .insert({
            dog_id: dog.id,
            registration_no: form.registration_no || null,
            registration_org: form.registration_org || null,
            registered_name: form.registered_name || null,
          })
      }

      toast.success(`${form.name}を追加しました！`)
      router.push(`/dogs/${dog.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '保存に失敗しました'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const STEPS = [
    { num: 1 as const, label: '基本情報' },
    { num: 2 as const, label: '血統書' },
    { num: 3 as const, label: '親犬' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      {/* ステップインジケーター */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <button
              type="button"
              onClick={() => setStep(s.num)}
              className="flex items-center gap-2 transition-all"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all"
                style={{
                  background: step >= s.num
                    ? 'linear-gradient(135deg, var(--color-gold-600), var(--color-gold-400))'
                    : 'var(--color-surface-2)',
                  color: step >= s.num ? 'var(--color-ink-950)' : 'var(--color-text-subtle)',
                  border: step >= s.num ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {s.num}
              </div>
              <span
                className="text-xs hidden sm:block"
                style={{ color: step === s.num ? 'var(--color-gold-300)' : 'var(--color-text-subtle)' }}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="mx-3 h-px w-8"
                style={{ background: step > s.num ? 'var(--color-gold-600)' : 'var(--color-border)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ステップ1：基本情報 */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="card-luxury p-6 space-y-5"
        >
          {/* 写真アップロード */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full transition-all"
              style={{
                background: photoPreview ? 'transparent' : 'var(--color-surface-2)',
                border: '2px dashed var(--color-border)',
              }}
            >
              {photoPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="プレビュー" className="h-full w-full object-cover rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6" style={{ color: 'var(--color-text-subtle)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>写真を追加</span>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>
          {photoPreview && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: 'var(--color-text-subtle)' }}
              >
                <X className="h-3 w-3" /> 写真を削除
              </button>
            </div>
          )}

          {/* 名前 */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              名前 <span style={{ color: 'var(--color-gold-500)' }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={update('name')}
              required
              className="input-luxury"
              placeholder="例：そら"
            />
          </div>

          {/* 犬種 */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              犬種 <span style={{ color: 'var(--color-gold-500)' }}>*</span>
            </label>
            <div className="relative">
              <select
                value={form.breed}
                onChange={update('breed')}
                required
                className="input-luxury appearance-none pr-10"
              >
                <option value="">選択してください</option>
                {BREEDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
            </div>
          </div>

          {/* 性別・誕生日 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                性別
              </label>
              <div className="relative">
                <select
                  value={form.gender}
                  onChange={update('gender')}
                  className="input-luxury appearance-none pr-10"
                >
                  <option value="">不明</option>
                  <option value="male">オス</option>
                  <option value="female">メス</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                誕生日
              </label>
              <input
                type="date"
                value={form.birth_date}
                onChange={update('birth_date')}
                className="input-luxury"
              />
            </div>
          </div>

          {/* 毛色 */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              毛色
            </label>
            <input
              type="text"
              value={form.color}
              onChange={update('color')}
              className="input-luxury"
              placeholder="例：ゴールデン、トライカラー"
            />
          </div>

          {/* 公開設定 */}
          <div className="flex items-center justify-between rounded-lg p-4" style={{ background: 'var(--color-surface-2)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-cream-200)' }}>プロフィールを公開する</p>
              <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>公開すると他のユーザーが閲覧できます</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, is_public: !prev.is_public }))}
              className="relative h-6 w-10 rounded-full transition-colors"
              style={{ background: form.is_public ? 'var(--color-gold-500)' : 'var(--color-border)' }}
              aria-checked={form.is_public}
              role="switch"
            >
              <span
                className="absolute top-0.5 h-5 w-5 rounded-full transition-transform"
                style={{
                  background: 'white',
                  transform: form.is_public ? 'translateX(1.25rem)' : 'translateX(0.125rem)',
                }}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="btn-gold flex w-full items-center justify-center gap-2"
          >
            次へ：血統書情報
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}

      {/* ステップ2：血統書 */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="card-luxury p-6 space-y-5"
        >
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            血統書をお持ちの場合は入力してください。スキップすることも可能です。
          </p>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              登録団体
            </label>
            <div className="relative">
              <select
                value={form.registration_org}
                onChange={update('registration_org')}
                className="input-luxury appearance-none pr-10"
              >
                <option value="">選択してください</option>
                {ORG_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              血統登録番号
            </label>
            <input
              type="text"
              value={form.registration_no}
              onChange={update('registration_no')}
              className="input-luxury"
              placeholder="例：JKC-12345678"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              登録名（血統書上の名前）
            </label>
            <input
              type="text"
              value={form.registered_name}
              onChange={update('registered_name')}
              className="input-luxury"
              placeholder="例：GOLDEN SKY OF SUNSHINE"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-ghost flex-1"
            >
              戻る
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="btn-gold flex flex-1 items-center justify-center gap-2"
            >
              次へ：親犬
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ステップ3：親犬 */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="card-luxury p-6 space-y-5"
        >
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            親犬の名前を入力してください。後からいつでも変更・紐付けできます。
          </p>

          <div
            className="rounded-lg p-4"
            style={{ background: 'color-mix(in srgb, #3b6ea0 8%, transparent)', border: '1px solid color-mix(in srgb, #3b6ea0 20%, transparent)' }}
          >
            <label className="mb-1.5 block text-xs font-medium" style={{ color: '#7aafd4' }}>
              父（Sire）
            </label>
            <input
              type="text"
              value={form.sire_name}
              onChange={update('sire_name')}
              className="input-luxury"
              placeholder="父犬の名前"
            />
          </div>

          <div
            className="rounded-lg p-4"
            style={{ background: 'color-mix(in srgb, #c0614a 8%, transparent)', border: '1px solid color-mix(in srgb, #c0614a 20%, transparent)' }}
          >
            <label className="mb-1.5 block text-xs font-medium" style={{ color: '#d4907e' }}>
              母（Dam）
            </label>
            <input
              type="text"
              value={form.dam_name}
              onChange={update('dam_name')}
              className="input-luxury"
              placeholder="母犬の名前"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-ghost flex-1"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold flex flex-1 items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  保存中...
                </span>
              ) : (
                '愛犬を登録する'
              )}
            </button>
          </div>
        </motion.div>
      )}
    </form>
  )
}
