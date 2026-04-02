'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, ChevronDown, ChefHat, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { BREEDS } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Ingredient { name: string; amount: string; unit: string }
interface Step { order: number; text: string }
interface GeneratedRecipe {
  title: string
  description: string
  ingredients: Ingredient[]
  steps: Step[]
  nutrition_notes: string
  caution: string
}

export default function GenerateRecipePage() {
  const [form, setForm] = useState({
    breed: '',
    size: 'medium' as 'small' | 'medium' | 'large',
    age: 'adult' as 'puppy' | 'adult' | 'senior',
    allergies: '',
    goal: '',
  })
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([])
  const [saving, setSaving] = useState<number | null>(null)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.breed) { toast.error('犬種を選択してください'); return }
    if (!form.goal) { toast.error('目的・悩みを入力してください'); return }

    setLoading(true)
    setRecipes([])

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('APIエラー')

      // ストリーミングでJSONを収集
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(Boolean)
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as {
                type: string; delta?: { type: string; text: string }
              }
              if (data.type === 'content_block_delta' && data.delta?.text) {
                fullText += data.delta.text
              }
            } catch { /* ignore */ }
          }
        }
      }

      // JSONをパース
      const parsed = JSON.parse(fullText) as { recipes: GeneratedRecipe[] }
      setRecipes(parsed.recipes)
    } catch {
      toast.error('レシピの生成に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (recipe: GeneratedRecipe, index: number) => {
    setSaving(index)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      await supabase.from('recipes').insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        target_breed: form.breed,
        target_size: form.size,
        target_age: form.age,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        nutrition_notes: recipe.nutrition_notes,
        caution: recipe.caution,
        is_ai_generated: true,
      })

      toast.success(`「${recipe.title}」を保存しました`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link
          href="/recipes"
          className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          レシピ一覧に戻る
        </Link>
        <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
          AI Recipe Generator
        </p>
        <h1
          className="text-3xl font-light"
          style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
        >
          AIレシピ生成
        </h1>
      </div>

      <div className="divider-gold mb-8" />

      {/* 入力フォーム */}
      <form onSubmit={handleGenerate} className="card-luxury mb-8 p-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* 犬種 */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              犬種 <span style={{ color: 'var(--color-gold-500)' }}>*</span>
            </label>
            <div className="relative">
              <select value={form.breed} onChange={update('breed')} required className="input-luxury appearance-none pr-10">
                <option value="">選択してください</option>
                {BREEDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
            </div>
          </div>

          {/* サイズ */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              サイズ
            </label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, size: s }))}
                  className="flex-1 rounded-lg py-2 text-xs transition-all"
                  style={{
                    background: form.size === s ? 'color-mix(in srgb, var(--color-gold-400) 15%, transparent)' : 'var(--color-surface-2)',
                    border: form.size === s ? '1px solid var(--color-gold-600)' : '1px solid var(--color-border)',
                    color: form.size === s ? 'var(--color-gold-300)' : 'var(--color-text-muted)',
                  }}
                >
                  {s === 'small' ? '小型' : s === 'medium' ? '中型' : '大型'}
                </button>
              ))}
            </div>
          </div>

          {/* 年齢 */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              年齢
            </label>
            <div className="flex gap-2">
              {(['puppy', 'adult', 'senior'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, age: a }))}
                  className="flex-1 rounded-lg py-2 text-xs transition-all"
                  style={{
                    background: form.age === a ? 'color-mix(in srgb, var(--color-gold-400) 15%, transparent)' : 'var(--color-surface-2)',
                    border: form.age === a ? '1px solid var(--color-gold-600)' : '1px solid var(--color-border)',
                    color: form.age === a ? 'var(--color-gold-300)' : 'var(--color-text-muted)',
                  }}
                >
                  {a === 'puppy' ? '子犬' : a === 'adult' ? '成犬' : 'シニア'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* アレルギー */}
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            アレルギー・苦手な食材
          </label>
          <input
            type="text"
            value={form.allergies}
            onChange={update('allergies')}
            className="input-luxury"
            placeholder="例：鶏肉アレルギー、小麦が苦手"
          />
        </div>

        {/* 目的・悩み */}
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            目的・悩み <span style={{ color: 'var(--color-gold-500)' }}>*</span>
          </label>
          <textarea
            value={form.goal}
            onChange={update('goal')}
            required
            rows={3}
            className="input-luxury resize-none"
            placeholder="例：食欲がない、毛並みをよくしたい、体重を管理したい"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold flex w-full items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              AIがレシピを考えています...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              レシピを生成する（3品）
            </>
          )}
        </button>
      </form>

      {/* 生成されたレシピ */}
      <AnimatePresence>
        {recipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2
              className="mb-2 text-xl font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
            >
              生成されたレシピ
            </h2>
            {recipes.map((recipe, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-luxury overflow-hidden"
              >
                {/* ゴールドライン */}
                <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--color-gold-600), var(--color-gold-400))' }} />

                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3
                      className="text-xl font-medium"
                      style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
                    >
                      {recipe.title}
                    </h3>
                    <button
                      onClick={() => handleSave(recipe, i)}
                      disabled={saving === i}
                      className="btn-ghost flex-shrink-0 text-xs disabled:opacity-50"
                    >
                      {saving === i ? '保存中...' : '保存する'}
                    </button>
                  </div>

                  <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {recipe.description}
                  </p>

                  {/* 材料 */}
                  <div className="mb-6">
                    <h4 className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
                      <ChefHat className="h-3.5 w-3.5" />
                      材料
                    </h4>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {recipe.ingredients.map((ing, j) => (
                        <div key={j} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--color-surface-2)' }}>
                          <span className="text-sm" style={{ color: 'var(--color-cream-200)' }}>{ing.name}</span>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.amount}{ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 手順 */}
                  <div className="mb-6">
                    <h4 className="mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
                      作り方
                    </h4>
                    <ol className="space-y-3">
                      {recipe.steps.map((step) => (
                        <li key={step.order} className="flex gap-3">
                          <span
                            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium"
                            style={{
                              background: 'color-mix(in srgb, var(--color-gold-400) 15%, transparent)',
                              color: 'var(--color-gold-400)',
                            }}
                          >
                            {step.order}
                          </span>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-cream-200)' }}>
                            {step.text}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* 注意事項 */}
                  {recipe.caution && (
                    <div
                      className="flex gap-3 rounded-lg p-3"
                      style={{ background: 'color-mix(in srgb, #c0614a 8%, transparent)', border: '1px solid color-mix(in srgb, #c0614a 20%, transparent)' }}
                    >
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#c0614a' }} />
                      <p className="text-xs leading-relaxed" style={{ color: '#d4907e' }}>{recipe.caution}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
