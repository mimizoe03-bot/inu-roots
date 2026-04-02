'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  PawPrint,
  GitBranch,
  MapPin,
  ChefHat,
  MessageCircle,
  Users,
  ArrowRight,
  Star,
} from 'lucide-react'

/* ───────── アニメーション設定 ───────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] },
  }),
}

/* ───────── 機能一覧 ───────── */
const features = [
  {
    icon: GitBranch,
    title: '家系図',
    desc: '血統書から最大5世代の家系をインタラクティブに可視化。父系・母系を色分けして一目で把握。',
    accent: '#d4944a',
  },
  {
    icon: MapPin,
    title: 'スポット検索',
    desc: '現在地周辺のドッグラン・ドッグカフェを地図で即検索。愛犬家のリアルなレビュー付き。',
    accent: '#7c9c6e',
  },
  {
    icon: ChefHat,
    title: 'AIレシピ',
    desc: '犬種・年齢・アレルギーを入力するだけで、獣医監修の手作りドッグフードレシピを自動生成。',
    accent: '#9b7abf',
  },
  {
    icon: MessageCircle,
    title: 'お悩みチャット',
    desc: '経験豊富な獣医師AIが24時間対応。健康・しつけ・ごはんまで気軽に相談。',
    accent: '#4a8fa8',
  },
  {
    icon: Users,
    title: 'コミュニティ',
    desc: '犬種別リアルタイムフィード。同じ犬種の仲間と情報交換・写真シェアを楽しんで。',
    accent: '#c0614a',
  },
  {
    icon: PawPrint,
    title: 'AIポートレート',
    desc: '愛犬の情報を入力するだけで、プロ仕上げのウォーターカラーポートレートを自動生成。',
    accent: '#d4944a',
  },
]

/* ───────── 統計数値 ───────── */
const stats = [
  { value: '10,000+', label: '登録頭数' },
  { value: '500+', label: '掲載スポット' },
  { value: '2,000+', label: 'レシピ数' },
  { value: '98%', label: '満足度' },
]

/* ───────── コンポーネント ───────── */
export default function LandingPage() {
  return (
    <div style={{ background: 'var(--color-background)' }}>
      {/* ナビゲーション */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(12px)', background: 'color-mix(in srgb, var(--color-background) 80%, transparent)' }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, var(--color-gold-600), var(--color-gold-400))' }}
          >
            <PawPrint className="h-4 w-4" style={{ color: 'var(--color-ink-950)' }} />
          </div>
          <span
            className="text-lg font-medium tracking-widest"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)' }}
          >
            いぬルーツ
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { label: '機能', href: '#features' },
            { label: 'マップ', href: '#map' },
            { label: 'レシピ', href: '#recipe' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs uppercase tracking-widest transition-colors duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-300)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost hidden md:inline-flex">
            ログイン
          </Link>
          <Link href="/register" className="btn-gold">
            無料で始める
          </Link>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center">
        {/* 背景装飾 */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--color-gold-600) 8%, transparent), transparent),
              radial-gradient(ellipse 50% 40% at 80% 80%, color-mix(in srgb, var(--color-gold-800) 6%, transparent), transparent)
            `,
          }}
        />
        {/* グリッドパターン */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(var(--color-gold-400) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold-400) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div
          className="relative z-10 max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* バッジ */}
          <motion.div variants={fadeUp} className="mb-8 flex justify-center">
            <span className="badge-gold flex items-center gap-1.5">
              <Star className="h-3 w-3" />
              プレミアム犬家系プラットフォーム
            </span>
          </motion.div>

          {/* メインコピー */}
          <motion.h1
            variants={fadeUp}
            className="mb-6 text-5xl font-light leading-tight tracking-wide md:text-7xl"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            愛犬の歴史を、
            <br />
            <span className="text-gradient-gold font-medium italic">未来へつなぐ。</span>
          </motion.h1>

          {/* サブコピー */}
          <motion.p
            variants={fadeUp}
            className="mx-auto mb-12 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            血統書から家系を登録し、インタラクティブな家系図で可視化。
            <br className="hidden md:block" />
            ドッグランの発見から手作りご飯まで、愛犬とのすべてを一つの場所に。
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register" className="btn-gold flex items-center gap-2 text-sm">
              愛犬を登録する
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/login" className="btn-ghost text-sm">
              デモを見る
            </Link>
          </motion.div>
        </motion.div>

        {/* 下矢印 */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <div className="h-8 w-[1px] mx-auto" style={{ background: 'linear-gradient(to bottom, var(--color-gold-600), transparent)' }} />
        </motion.div>
      </section>

      {/* 統計 */}
      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col items-center justify-center py-10 px-6"
              style={{ borderRight: i < stats.length - 1 ? '1px solid var(--color-border)' : 'none' }}
            >
              <span
                className="mb-1 text-3xl font-light tracking-tight md:text-4xl"
                style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-gold-300)' }}
              >
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-3 text-center text-xs uppercase tracking-widest"
            style={{ color: 'var(--color-gold-500)' }}
          >
            Features
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mb-16 text-center text-3xl font-light md:text-5xl"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            愛犬との生活を、もっと豊かに
          </motion.h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                className="card-luxury group p-6"
              >
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in srgb, ${f.accent} 12%, transparent)` }}
                >
                  <f.icon className="h-5 w-5" style={{ color: f.accent }} />
                </div>
                <h3
                  className="mb-2 text-lg font-medium"
                  style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 家系図プレビュー */}
      <section
        className="mx-auto max-w-6xl px-6 py-28"
        id="map"
      >
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.p
              variants={fadeUp}
              className="mb-3 text-xs uppercase tracking-widest"
              style={{ color: 'var(--color-gold-500)' }}
            >
              Pedigree Tree
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mb-6 text-3xl font-light md:text-4xl"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
            >
              血統を、アートに。
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mb-8 text-sm leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              最大5世代の家系を美しいインタラクティブツリーで表示。
              父系は青、母系はローズで色分けされ、血統の流れが一目でわかります。
              ノードをクリックすると各犬の詳細プロフィールへ即アクセス。
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/register" className="btn-gold inline-flex items-center gap-2">
                家系図を作成する
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* 家系図ダミービジュアル */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
            className="card-luxury relative overflow-hidden"
            style={{ height: '320px' }}
          >
            {/* 仮のツリーSVG */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 280" fill="none">
              {/* 接続線 */}
              <line x1="200" y1="220" x2="120" y2="140" stroke="#3b6ea0" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
              <line x1="200" y1="220" x2="280" y2="140" stroke="#a05b72" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
              <line x1="120" y1="140" x2="70" y2="60" stroke="#3b6ea0" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
              <line x1="120" y1="140" x2="170" y2="60" stroke="#a05b72" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
              <line x1="280" y1="140" x2="230" y2="60" stroke="#3b6ea0" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
              <line x1="280" y1="140" x2="330" y2="60" stroke="#a05b72" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />

              {/* 祖父母ノード（最上段） */}
              {[70, 170, 230, 330].map((x, i) => (
                <g key={x}>
                  <rect x={x - 32} y="40" width="64" height="36" rx="6"
                    fill="#1c1916" stroke={i % 2 === 0 ? '#3b6ea0' : '#a05b72'} strokeWidth="1" opacity="0.8" />
                  <text x={x} y="60" textAnchor="middle" fill="#8a7d6d" fontSize="9" fontFamily="sans-serif">
                    {['チェリー', 'ベル', 'マロン', 'アン'][i]}
                  </text>
                  <text x={x} y="70" textAnchor="middle" fill="#6b6054" fontSize="7.5" fontFamily="sans-serif">
                    {['父系', '母系', '父系', '母系'][i]}
                  </text>
                </g>
              ))}

              {/* 親ノード（中段） */}
              {[{ x: 120, label: 'レオ', sub: '父' }, { x: 280, label: 'ハナ', sub: '母' }].map(({ x, label, sub }) => (
                <g key={x}>
                  <rect x={x - 38} y="118" width="76" height="44" rx="8"
                    fill="#1c1916" stroke={sub === '父' ? '#3b6ea0' : '#a05b72'} strokeWidth="1.5" />
                  <circle cx={x} cy="128" r="12" fill="#322e28" stroke={sub === '父' ? '#3b6ea0' : '#a05b72'} strokeWidth="1" />
                  <text x={x} y="149" textAnchor="middle" fill="#e8e2da" fontSize="10" fontFamily="sans-serif" fontWeight="500">
                    {label}
                  </text>
                  <text x={x} y="159" textAnchor="middle" fill="#6b6054" fontSize="8" fontFamily="sans-serif">
                    {sub}
                  </text>
                </g>
              ))}

              {/* 主役ノード（下段） */}
              <g>
                <rect x="152" y="196" width="96" height="52" rx="10"
                  fill="#322e28" stroke="#c47a2e" strokeWidth="2" />
                <circle cx="200" cy="208" r="14" fill="#1c1916" stroke="#c47a2e" strokeWidth="1.5" />
                <text x="200" y="227" textAnchor="middle" fill="#f5f0e8" fontSize="12" fontFamily="sans-serif" fontWeight="600">
                  そら
                </text>
                <text x="200" y="239" textAnchor="middle" fill="#8a7d6d" fontSize="9" fontFamily="sans-serif">
                  ゴールデンレトリーバー
                </text>
              </g>
            </svg>

            {/* オーバーレイグラデーション */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--color-gold-800) 8%, transparent), transparent 70%)' }}
            />
          </motion.div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="relative overflow-hidden py-32">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 50% 50%, color-mix(in srgb, var(--color-gold-700) 8%, transparent), transparent)',
          }}
        />
        <div className="divider-gold mx-auto mb-24 max-w-sm" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="relative z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="mb-6 text-4xl font-light md:text-5xl"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            さあ、愛犬の物語を
            <br />
            <span className="text-gradient-gold italic">はじめましょう。</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mb-10 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            登録は無料。家系図1頭から始められます。
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register" className="btn-gold flex items-center gap-2 text-sm">
              無料で始める
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="divider-gold mx-auto mt-24 max-w-sm" />
      </section>

      {/* フッター */}
      <footer
        className="px-6 py-10 text-center"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <PawPrint className="h-4 w-4" style={{ color: 'var(--color-gold-600)' }} />
          <span
            className="text-sm tracking-widest"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-muted)' }}
          >
            いぬルーツ
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
          © 2026 InuRoots. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
