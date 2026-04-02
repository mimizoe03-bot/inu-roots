'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PawPrint, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

/* 入力フォームの状態 */
interface FormState {
  username: string
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

const PERKS = [
  '家系図を無制限に作成',
  '愛犬プロフィール登録',
  'AIお悩みチャット',
  'ドッグランマップ利用',
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'verify'>('form')

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('パスワードが一致しません')
      return
    }
    if (form.password.length < 8) {
      toast.error('パスワードは8文字以上で入力してください')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username,
            display_name: form.displayName || form.username,
          },
        },
      })

      if (error) throw error

      setStep('verify')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登録に失敗しました'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  if (step === 'verify') {
    return (
      <div className="flex min-h-screen items-center justify-center px-6" style={{ background: 'var(--color-background)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="card-luxury max-w-sm w-full p-10 text-center"
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'color-mix(in srgb, var(--color-gold-400) 12%, transparent)', border: '1px solid var(--color-gold-700)' }}
          >
            <Mail className="h-7 w-7" style={{ color: 'var(--color-gold-400)' }} />
          </div>
          <h2
            className="mb-3 text-2xl font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            メールを確認してください
          </h2>
          <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            <strong style={{ color: 'var(--color-cream-200)' }}>{form.email}</strong> に確認メールを送信しました。
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <Link href="/login" className="btn-ghost inline-flex">
            ログインページへ
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* 左パネル */}
      <div
        className="relative hidden lg:flex lg:w-2/5 lg:flex-col lg:justify-center lg:px-12"
        style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, color-mix(in srgb, var(--color-gold-700) 8%, transparent), transparent)' }}
        />
        <div className="relative z-10">
          <Link href="/" className="mb-12 flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg, var(--color-gold-600), var(--color-gold-400))' }}
            >
              <PawPrint className="h-4 w-4" style={{ color: 'var(--color-ink-950)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)', fontSize: '1.125rem', letterSpacing: '0.1em' }}>
              いぬルーツ
            </span>
          </Link>

          <h2
            className="mb-4 text-3xl font-light leading-snug"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            愛犬との物語を
            <br />
            <span className="text-gradient-gold italic">はじめよう。</span>
          </h2>
          <p className="mb-10 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            登録無料。いつでもキャンセルできます。
          </p>

          <ul className="space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <div
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--color-gold-400) 15%, transparent)' }}
                >
                  <Check className="h-3 w-3" style={{ color: 'var(--color-gold-400)' }} />
                </div>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 右パネル（フォーム） */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="mb-8">
            <h1
              className="mb-2 text-2xl font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
            >
              アカウントを作成
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              すべての項目を入力してください
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* ユーザーネーム */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                ユーザーネーム
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
                <input
                  type="text"
                  value={form.username}
                  onChange={update('username')}
                  required
                  pattern="[a-zA-Z0-9_-]{3,20}"
                  className="input-luxury pl-10"
                  placeholder="inu_taro"
                />
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                英数字・アンダースコア・ハイフン（3〜20文字）
              </p>
            </div>

            {/* 表示名 */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                表示名
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={update('displayName')}
                className="input-luxury"
                placeholder="田中 太郎"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  required
                  className="input-luxury pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={8}
                  className="input-luxury pl-10 pr-10"
                  placeholder="8文字以上"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-subtle)' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                パスワード（確認）
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  required
                  className="input-luxury pl-10"
                  placeholder="パスワードを再入力"
                />
              </div>
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold mt-2 flex w-full items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  登録中...
                </span>
              ) : (
                <>
                  アカウントを作成する
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* 区切り */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>または</span>
            <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
          </div>

          {/* Google 登録 */}
          <button
            onClick={handleGoogleSignup}
            className="btn-ghost flex w-full items-center justify-center gap-3"
            style={{ letterSpacing: 'normal', textTransform: 'none', fontSize: '0.875rem' }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google で登録
          </button>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            すでにアカウントをお持ちの方は{' '}
            <Link
              href="/login"
              className="font-medium"
              style={{ color: 'var(--color-gold-400)' }}
            >
              ログイン
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
