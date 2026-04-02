'use client'

import { useState } from 'react'
import { Send, Image as ImageIcon, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validateImageFile } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BreedPostFormProps {
  breed: string
  userId: string
}

export default function BreedPostForm({ breed, userId }: BreedPostFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const valid: File[] = []
    const newPreviews: string[] = []

    for (const file of files) {
      const err = validateImageFile(file)
      if (err) { toast.error(err); continue }
      if (photos.length + valid.length >= 4) { toast.error('写真は最大4枚までです'); break }
      valid.push(file)
      newPreviews.push(URL.createObjectURL(file))
    }

    setPhotos((prev) => [...prev, ...valid])
    setPreviews((prev) => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error('本文を入力してください'); return }

    setLoading(true)
    try {
      const supabase = createClient()

      // 写真をアップロード
      const photoUrls: string[] = []
      for (const photo of photos) {
        const ext = photo.name.split('.').pop()
        const path = `${userId}/posts/${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage.from('dog-photos').upload(path, photo)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(path)
        photoUrls.push(publicUrl)
      }

      // 投稿を保存
      const { error } = await supabase.from('posts').insert({
        user_id: userId,
        breed,
        content: content.trim(),
        photos: photoUrls.length > 0 ? photoUrls : null,
      })

      if (error) throw error

      toast.success('投稿しました！')
      setContent('')
      setPhotos([])
      setPreviews([])
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '投稿に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`${breed}について投稿しましょう...`}
        rows={3}
        className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
        style={{ color: 'var(--color-text)', caretColor: 'var(--color-gold-400)' }}
      />

      {/* 写真プレビュー */}
      {previews.length > 0 && (
        <div className="mb-3 flex gap-2 flex-wrap">
          {previews.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full"
                style={{ background: 'var(--color-ink-800)', color: 'white' }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className="mt-3 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}
      >
        <label className="flex cursor-pointer items-center gap-2 text-xs transition-colors" style={{ color: 'var(--color-text-muted)' }}>
          <ImageIcon className="h-4 w-4" />
          写真を追加
          <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoAdd} />
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="btn-gold flex items-center gap-2 disabled:opacity-50"
          style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
        >
          {loading ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
          ) : (
            <Send className="h-3 w-3" />
          )}
          投稿する
        </button>
      </div>
    </div>
  )
}
