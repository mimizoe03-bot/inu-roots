'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PawPrint, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

      router.push('/dogs')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--color-background)' }}
    >
      {/* 左パネル（デコレーション） */}
      <div
        className="relative hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center"
        style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 50% 30%, color-mix(in srgb, var(--color-gold-700) 10%, transparent), transparent)',
          }}
        />
        <div className="relative z-10 max-w-sm px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg, var(--color-gold-600), var(--color-gold-400))' }}
            >
              <PawPrint className="h-8 w-8" style={{ color: 'var(--color-ink-950)' }} />
            </div>
            <h2
              className="mb-4 text-4xl font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
            >
              いぬルーツ
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              愛犬の家系を記録し、
              <br />
              美しい物語を紡いでいく。
            </p>
          </motion.div>
        </div>
        {/* 下部装飾 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-700), transparent)' }}
        />
      </div>

      {/* 右パネル（フォーム） */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {/* ヘッダー */}
          <div className="mb-10">
            <Link
              href="/"
              className="mb-8 flex items-center gap-2 lg:hidden"
            >
              <PawPrint className="h-5 w-5" style={{ color: 'var(--color-gold-400)' }} />
              <span style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)', fontSize: '1.125rem' }}>
                いぬルーツ
              </span>
            </Link>
            <h1
              className="mb-2 text-2xl font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
            >
              おかえりなさい
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              アカウントにログインしてください
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* メールアドレス */}
            <div>
              <label
                className="mb-2 block text-xs uppercase tracking-widest"
                style={{ color: 'var(--color-text-muted)' }}
              >
                メールアドレス
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--color-text-subtle)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-luxury pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label
                className="mb-2 block text-xs uppercase tracking-widest"
                style={{ color: 'var(--color-text-muted)' }}
              >
                パスワード
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--color-text-subtle)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-luxury pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--color-text-subtle)' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold flex w-full items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ログイン中...
                </span>
              ) : (
                <>
                  ログイン
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* 区切り */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>または</span>
            <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
          </div>

          {/* Google ログイン */}
          <button
            onClick={handleGoogleLogin}
            className="btn-ghost flex w-full items-center justify-center gap-3 normal-case tracking-normal"
            style={{ letterSpacing: 'normal', textTransform: 'none', fontSize: '0.875rem' }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google でログイン
          </button>

          {/* 新規登録リンク */}
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            アカウントをお持ちでない方は{' '}
            <Link
              href="/register"
              className="font-medium transition-colors"
              style={{ color: 'var(--color-gold-400)' }}
            >
              新規登録
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
