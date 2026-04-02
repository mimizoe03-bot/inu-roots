'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Upload, ChevronDown, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BREEDS, validateImageFile } from '@/lib/utils'
import { toast } from 'sonner'
import type { Dog, PedigreeRecord } from '@/lib/supabase/types'

interface DogEditFormProps {
  dog: Dog
  pedigree: PedigreeRecord | null
}

export default function DogEditForm({ dog, pedigree }: DogEditFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(dog.photo_url)

  const [form, setForm] = useState({
    name: dog.name,
    breed: dog.breed,
    gender: dog.gender ?? '',
    birth_date: dog.birth_date ?? '',
    color: dog.color ?? '',
    is_public: dog.is_public,
    registration_no: pedigree?.registration_no ?? '',
    registration_org: pedigree?.registration_org ?? '',
    registered_name: pedigree?.registered_name ?? '',
  })

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { toast.error(err); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      let photoUrl = dog.photo_url
      if (photoFile) {
        const { data: { user } } = await supabase.auth.getUser()
        const ext = photoFile.name.split('.').pop()
        const path = `${user!.id}/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('dog-photos').upload(path, photoFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(path)
        photoUrl = publicUrl
      }

      // 犬の基本情報を更新
      const { error: dogError } = await supabase
        .from('dogs')
        .update({
          name: form.name,
          breed: form.breed,
          gender: (form.gender as 'male' | 'female') || null,
          birth_date: form.birth_date || null,
          color: form.color || null,
          is_public: form.is_public,
          photo_url: photoUrl,
        })
        .eq('id', dog.id)

      if (dogError) throw dogError

      // 血統書を upsert
      if (form.registration_no || form.registration_org || form.registered_name) {
        if (pedigree) {
          await supabase
            .from('pedigree_records')
            .update({
              registration_no: form.registration_no || null,
              registration_org: form.registration_org || null,
              registered_name: form.registered_name || null,
            })
            .eq('id', pedigree.id)
        } else {
          await supabase.from('pedigree_records').insert({
            dog_id: dog.id,
            registration_no: form.registration_no || null,
            registration_org: form.registration_org || null,
            registered_name: form.registered_name || null,
          })
        }
      }

      toast.success('保存しました')
      router.push(`/dogs/${dog.id}`)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`${dog.name}を削除してもよろしいですか？この操作は取り消せません。`)) return

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('dogs').delete().eq('id', dog.id)
      if (error) throw error
      toast.success(`${dog.name}を削除しました`)
      router.push('/dogs')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '削除に失敗しました')
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 写真 */}
      <div className="card-luxury p-6">
        <h2 className="mb-4 text-sm uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          写真
        </h2>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-24 w-24 overflow-hidden rounded-full flex-shrink-0"
            style={{ border: '2px dashed var(--color-border)' }}
          >
            {photoPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                <Upload className="h-5 w-5" style={{ color: 'var(--color-text-subtle)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>変更</span>
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} />
          <div>
            <p className="text-sm" style={{ color: 'var(--color-cream-200)' }}>プロフィール写真</p>
            <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>jpg・png・webp / 最大5MB</p>
            {dog.ai_portrait_url && (
              <p className="mt-1 text-xs" style={{ color: 'var(--color-gold-500)' }}>AIポートレート生成済み</p>
            )}
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="card-luxury p-6 space-y-5">
        <h2 className="text-sm uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>基本情報</h2>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            名前 <span style={{ color: 'var(--color-gold-500)' }}>*</span>
          </label>
          <input type="text" value={form.name} onChange={update('name')} required className="input-luxury" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            犬種 <span style={{ color: 'var(--color-gold-500)' }}>*</span>
          </label>
          <div className="relative">
            <select value={form.breed} onChange={update('breed')} required className="input-luxury appearance-none pr-10">
              {BREEDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>性別</label>
            <div className="relative">
              <select value={form.gender} onChange={update('gender')} className="input-luxury appearance-none pr-10">
                <option value="">不明</option>
                <option value="male">オス</option>
                <option value="female">メス</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>誕生日</label>
            <input type="date" value={form.birth_date} onChange={update('birth_date')} className="input-luxury" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>毛色</label>
          <input type="text" value={form.color} onChange={update('color')} className="input-luxury" placeholder="例：ゴールデン" />
        </div>

        {/* 公開設定 */}
        <div className="flex items-center justify-between rounded-lg p-4" style={{ background: 'var(--color-surface-2)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-cream-200)' }}>プロフィールを公開する</p>
            <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>公開すると他のユーザーが閲覧できます</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, is_public: !p.is_public }))}
            className="relative h-6 w-10 rounded-full transition-colors"
            style={{ background: form.is_public ? 'var(--color-gold-500)' : 'var(--color-border)' }}
            role="switch"
            aria-checked={form.is_public}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full transition-transform"
              style={{ background: 'white', transform: form.is_public ? 'translateX(1.25rem)' : 'translateX(0.125rem)' }}
            />
          </button>
        </div>
      </div>

      {/* 血統書 */}
      <div className="card-luxury p-6 space-y-5">
        <h2 className="text-sm uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>血統書情報</h2>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>登録団体</label>
          <div className="relative">
            <select value={form.registration_org} onChange={update('registration_org')} className="input-luxury appearance-none pr-10">
              <option value="">選択してください</option>
              {['JKC（ジャパンケネルクラブ）', 'AKC', 'FCI', 'UKC', 'その他'].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>血統登録番号</label>
          <input type="text" value={form.registration_no} onChange={update('registration_no')} className="input-luxury" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>登録名</label>
          <input type="text" value={form.registered_name} onChange={update('registered_name')} className="input-luxury" />
        </div>
      </div>

      {/* 保存・削除 */}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-gold flex flex-1 items-center justify-center gap-2 disabled:opacity-50">
          {loading ? (
            <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />保存中...</>
          ) : '変更を保存する'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs transition-colors disabled:opacity-50"
          style={{ border: '1px solid color-mix(in srgb, #c0614a 40%, transparent)', color: '#c0614a' }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          削除
        </button>
      </div>
    </form>
  )
}
