'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AIPortraitButtonProps {
  dogId: string
  breed: string
  color: string
  name: string
}

export default function AIPortraitButton({ dogId, breed, color, name }: AIPortraitButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    toast.info('AIポートレートを生成中です... 少しお待ちください')

    try {
      const res = await fetch('/api/image-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogId, breed, color, name }),
      })

      if (!res.ok) {
        const { error } = await res.json() as { error: string }
        throw new Error(error)
      }

      toast.success('AIポートレートを生成しました！')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '生成に失敗しました'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs transition-colors disabled:opacity-50"
      style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--color-gold-300)' }}
      title="AIポートレートを生成"
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {loading ? '生成中...' : 'AIポートレート'}
    </button>
  )
}
