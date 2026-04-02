import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ChefHat, Sparkles, Clock, Users } from 'lucide-react'
import type { Recipe } from '@/lib/supabase/types'

export const metadata = { title: 'レシピ' }

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const sizeLabel = { small: '小型犬', medium: '中型犬', large: '大型犬', all: '全サイズ' }
  const ageLabel = { puppy: '子犬', adult: '成犬', senior: 'シニア', all: '全年齢' }

  return (
    <div className="card-luxury flex flex-col overflow-hidden">
      {/* ヘッダーカラー */}
      <div
        className="h-2 w-full"
        style={{
          background: recipe.is_ai_generated
            ? 'linear-gradient(90deg, var(--color-gold-600), var(--color-gold-400))'
            : 'linear-gradient(90deg, #4a8fa8, #7cb9d0)',
        }}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3
            className="text-lg font-medium leading-tight"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            {recipe.title}
          </h3>
          {recipe.is_ai_generated && (
            <span className="badge-gold flex flex-shrink-0 items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </span>
          )}
        </div>

        {recipe.description && (
          <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {recipe.description}
          </p>
        )}

        {/* タグ */}
        <div className="mb-4 flex flex-wrap gap-2">
          {recipe.target_breed && (
            <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
              {recipe.target_breed}
            </span>
          )}
          {recipe.target_size && recipe.target_size !== 'all' && (
            <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
              {sizeLabel[recipe.target_size]}
            </span>
          )}
          {recipe.target_age && recipe.target_age !== 'all' && (
            <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
              {ageLabel[recipe.target_age]}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
            <Users className="h-3 w-3" />
            {(recipe.ingredients as unknown[]).length} 食材
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
            <Clock className="h-3 w-3" />
            {(recipe.steps as unknown[]).length} 手順
          </span>
        </div>
      </div>
    </div>
  )
}

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 公式レシピ + 自分のレシピを取得
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .or(`user_id.eq.${user!.id},user_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
            Recipes
          </p>
          <h1
            className="text-3xl font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            手作りレシピ
          </h1>
        </div>
        <Link href="/recipes/generate" className="btn-gold flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          AIで生成
        </Link>
      </div>

      <div className="divider-gold mb-8" />

      {/* レシピグリッド */}
      {!recipes || recipes.length === 0 ? (
        <div className="card-luxury flex flex-col items-center justify-center py-20 text-center">
          <ChefHat className="mb-4 h-12 w-12 opacity-20" style={{ color: 'var(--color-gold-400)' }} />
          <h2
            className="mb-3 text-xl font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)' }}
          >
            まだレシピがありません
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            AIで愛犬に合ったレシピを生成してみましょう。
          </p>
          <Link href="/recipes/generate" className="btn-gold flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            AIレシピを生成する
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
