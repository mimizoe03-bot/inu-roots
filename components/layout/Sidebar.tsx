'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PawPrint,
  GitBranch,
  MapPin,
  ChefHat,
  MessageCircle,
  Users,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/supabase/types'

interface SidebarProps {
  profile: Profile | null
}

const NAV_ITEMS = [
  { href: '/dogs',      icon: PawPrint,       label: '愛犬一覧' },
  { href: '/map',       icon: MapPin,         label: 'マップ' },
  { href: '/recipes',   icon: ChefHat,        label: 'レシピ' },
  { href: '/chat',      icon: MessageCircle,  label: 'お悩み相談' },
  { href: '/community', icon: Users,          label: 'コミュニティ' },
]

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* ロゴ */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <Link href="/dogs" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-gold-600), var(--color-gold-400))' }}
          >
            <PawPrint className="h-4 w-4" style={{ color: 'var(--color-ink-950)' }} />
          </div>
          <span
            className="text-base tracking-widest"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)' }}
          >
            いぬルーツ
          </span>
        </Link>
      </div>

      {/* 新規追加ボタン */}
      <div className="px-4 py-4">
        <Link
          href="/dogs/new"
          className="btn-gold flex w-full items-center justify-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <Plus className="h-3.5 w-3.5" />
          愛犬を追加
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p
          className="mb-2 px-3 text-xs uppercase tracking-widest"
          style={{ color: 'var(--color-text-subtle)' }}
        >
          Menu
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200"
                  style={{
                    color: active ? 'var(--color-gold-300)' : 'var(--color-text-muted)',
                    background: active ? 'color-mix(in srgb, var(--color-gold-400) 8%, transparent)' : 'transparent',
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'color-mix(in srgb, var(--color-gold-400) 8%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--color-gold-400) 20%, transparent)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="relative h-4 w-4 flex-shrink-0" />
                  <span className="relative">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ボトム：プロフィール */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5">
          {/* アバター */}
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium"
            style={{
              background: 'color-mix(in srgb, var(--color-gold-400) 15%, transparent)',
              border: '1px solid var(--color-gold-700)',
              color: 'var(--color-gold-300)',
            }}
          >
            {profile?.display_name?.charAt(0) ?? profile?.username?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" style={{ color: 'var(--color-cream-200)' }}>
              {profile?.display_name ?? profile?.username ?? 'ゲスト'}
            </p>
            <p className="truncate text-xs" style={{ color: 'var(--color-text-subtle)' }}>
              @{profile?.username}
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <Link
            href="/settings"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Settings className="h-3.5 w-3.5" />
            設定
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <LogOut className="h-3.5 w-3.5" />
            ログアウト
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* デスクトップサイドバー */}
      <aside
        className="hidden w-60 flex-shrink-0 lg:flex lg:flex-col"
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* モバイルハンバーガー */}
      <button
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
      </button>

      {/* モバイルドロワー */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
              style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
            >
              <button
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ color: 'var(--color-text-muted)' }}
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
