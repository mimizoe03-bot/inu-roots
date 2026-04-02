'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Mail, User, MapPin, ChevronDown, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PREFECTURES, validateImageFile } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/supabase/types'

interface SettingsClientProps {
  profile: Profile | null
  userEmail: string
}

export default function SettingsClient({ profile, userEmail }: SettingsClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null)

  const [form, setForm] = useState({
    display_name: profile?.display_name ?? '',
    username: profile?.username ?? '',
    prefecture: profile?.prefecture ?? '',
  })

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { toast.error(err); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username.trim()) { toast.error('ユーザーネームは必須です'); return }

    setLoading(true)
    try {
      const supabase = createClient()

      let avatarUrl = profile?.avatar_url ?? null
      if (avatarFile) {
        const { data: { user } } = await supabase.auth.getUser()
        const ext = avatarFile.name.split('.').pop()
        const path = `${user!.id}/avatar.${ext}`
        const { error } = await supabase.storage.from('dog-photos').upload(path, avatarFile, { upsert: true })
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(path)
        avatarUrl = publicUrl
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: form.display_name || null,
          username: form.username,
          prefecture: form.prefecture || null,
          avatar_url: avatarUrl,
        })
        .eq('id', profile!.id)

      if (error) {
        if (error.code === '23505') throw new Error('このユーザーネームはすでに使われています')
        throw error
      }

      toast.success('プロフィールを更新しました')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8">
        <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>Settings</p>
        <h1 className="text-3xl font-light" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}>
          設定
        </h1>
      </div>

      <div className="divider-gold mb-8" />

      <form onSubmit={handleSave} className="space-y-6">
        {/* アバター */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-6"
        >
          <h2 className="mb-4 text-sm uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            アバター
          </h2>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-20 w-20 overflow-hidden rounded-full flex-shrink-0"
              style={{ border: '2px solid var(--color-border)' }}
            >
              {avatarPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </>
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-2xl font-medium"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-gold-400)' }}
                >
                  {(form.display_name || form.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarSelect} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-cream-200)' }}>
                {form.display_name || form.username || 'ユーザー'}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{userEmail}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs transition-colors"
                style={{ color: 'var(--color-gold-500)' }}
              >
                写真を変更
              </button>
            </div>
          </div>
        </motion.div>

        {/* プロフィール情報 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-luxury p-6 space-y-5"
        >
          <h2 className="text-sm uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            プロフィール
          </h2>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              表示名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
              <input
                type="text"
                value={form.display_name}
                onChange={update('display_name')}
                className="input-luxury pl-10"
                placeholder="田中 太郎"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              ユーザーネーム <span style={{ color: 'var(--color-gold-500)' }}>*</span>
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--color-text-subtle)' }}
              >@</span>
              <input
                type="text"
                value={form.username}
                onChange={update('username')}
                required
                pattern="[a-zA-Z0-9_-]{3,20}"
                className="input-luxury pl-8"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              都道府県
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
              <select
                value={form.prefecture}
                onChange={update('prefecture')}
                className="input-luxury appearance-none pl-10 pr-10"
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
            </div>
          </div>

          <div className="rounded-lg p-4" style={{ background: 'var(--color-surface-2)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <Mail className="h-4 w-4" />
              <span>{userEmail}</span>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-subtle)' }}>メールアドレスは変更できません</p>
          </div>
        </motion.div>

        {/* 保存ボタン */}
        <button type="submit" disabled={loading} className="btn-gold flex w-full items-center justify-center gap-2 disabled:opacity-50">
          {loading ? (
            <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />保存中...</>
          ) : '変更を保存する'}
        </button>
      </form>

      {/* ログアウト */}
      <div className="mt-6">
        <div className="divider-gold mb-6" />
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm transition-colors"
          style={{ border: '1px solid color-mix(in srgb, #c0614a 30%, transparent)', color: '#c0614a' }}
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </div>
    </div>
  )
}
