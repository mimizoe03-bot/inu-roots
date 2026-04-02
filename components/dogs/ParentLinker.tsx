'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Plus, X, Search, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Dog } from '@/lib/supabase/types'

interface ParentLinkerProps {
  dogId: string
  currentSire: Dog | null
  currentDam: Dog | null
  allDogs: Dog[]  // ユーザーの全愛犬
}

type Role = 'sire' | 'dam'

export default function ParentLinker({ dogId, currentSire, currentDam, allDogs }: ParentLinkerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>('sire')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // 自分自身と既に選ばれている親を除いたリスト
  const candidates = allDogs.filter((d) => {
    if (d.id === dogId) return false
    if (search) return d.name.includes(search) || d.breed.includes(search)
    return true
  })

  const linkParent = async (parentId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: dogId, parentId, role: selectedRole }),
      })
      if (!res.ok) {
        const { error } = await res.json() as { error: string }
        throw new Error(error)
      }
      toast.success(`${selectedRole === 'sire' ? '父' : '母'}犬を登録しました`)
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const unlinkParent = async (role: Role) => {
    try {
      const res = await fetch(`/api/relationships?childId=${dogId}&role=${role}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('削除に失敗しました')
      toast.success('親犬の紐付けを解除しました')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  return (
    <div className="card-luxury p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-lg font-light"
          style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
        >
          <Link2 className="h-4 w-4" style={{ color: 'var(--color-gold-500)' }} />
          親犬の紐付け
        </h2>
        <button
          onClick={() => setOpen(!open)}
          className="btn-gold flex items-center gap-1.5"
          style={{ padding: '0.375rem 0.875rem', fontSize: '0.6875rem' }}
        >
          <Plus className="h-3 w-3" />
          追加
        </button>
      </div>

      {/* 現在の親犬 */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { role: 'sire' as Role, label: '父（Sire）', dog: currentSire, color: '#3b6ea0' },
          { role: 'dam' as Role, label: '母（Dam）', dog: currentDam, color: '#a05b72' },
        ].map(({ role, label, dog, color }) => (
          <div
            key={role}
            className="flex items-center justify-between rounded-lg p-3"
            style={{
              background: `color-mix(in srgb, ${color} 6%, transparent)`,
              border: `1px solid ${color}30`,
            }}
          >
            <div>
              <p className="mb-0.5 text-xs font-medium" style={{ color }}>
                {label}
              </p>
              <p className="text-sm" style={{ color: dog ? 'var(--color-cream-200)' : 'var(--color-text-subtle)' }}>
                {dog ? dog.name : '未登録'}
              </p>
              {dog && (
                <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{dog.breed}</p>
              )}
            </div>
            {dog && (
              <button
                onClick={() => unlinkParent(role)}
                className="flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                style={{ color: 'var(--color-text-subtle)' }}
                title="紐付けを解除"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 親犬選択パネル */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {/* 役割選択 */}
              <div className="flex gap-2">
                {(['sire', 'dam'] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className="flex-1 rounded-lg py-2 text-xs transition-all"
                    style={{
                      background: selectedRole === r
                        ? r === 'sire' ? 'color-mix(in srgb, #3b6ea0 15%, transparent)' : 'color-mix(in srgb, #a05b72 15%, transparent)'
                        : 'var(--color-surface-2)',
                      border: selectedRole === r
                        ? `1px solid ${r === 'sire' ? '#3b6ea060' : '#a05b7260'}`
                        : '1px solid var(--color-border)',
                      color: selectedRole === r
                        ? r === 'sire' ? '#7aafd4' : '#d4907e'
                        : 'var(--color-text-muted)',
                    }}
                  >
                    {r === 'sire' ? '父犬として登録' : '母犬として登録'}
                  </button>
                ))}
              </div>

              {/* 検索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="名前・犬種で検索"
                  className="input-luxury pl-9 text-xs"
                />
              </div>

              {/* 候補リスト */}
              {candidates.length === 0 ? (
                <p className="py-4 text-center text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                  候補がありません
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {candidates.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => linkParent(d.id)}
                      disabled={loading}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors disabled:opacity-50"
                      style={{ background: 'var(--color-surface-2)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in srgb, var(--color-gold-400) 6%, transparent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                    >
                      {d.photo_url || d.ai_portrait_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.ai_portrait_url ?? d.photo_url ?? ''}
                          alt={d.name}
                          className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                          style={{ background: 'var(--color-surface)', color: 'var(--color-gold-600)', fontSize: '12px' }}
                        >
                          {d.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-cream-200)' }}>{d.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{d.breed}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
