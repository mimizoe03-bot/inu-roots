'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Wifi, WifiOff, PawPrint } from 'lucide-react'
import { useBreedFeed, useLike } from '@/hooks/useRealtime'
import type { Post } from '@/lib/supabase/types'

interface PostWithProfile extends Post {
  profiles: { username: string; display_name: string | null } | null
}

interface BreedFeedProps {
  breed: string
  userId: string
  initialPosts: PostWithProfile[]
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'たった今'
  if (mins < 60) return `${mins}分前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

function PostCard({
  post,
  userId,
  onLike,
}: {
  post: PostWithProfile
  userId: string
  onLike: (id: string, likes: number) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      className="card-luxury p-5"
    >
      {/* ユーザー情報 */}
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium"
          style={{
            background: 'color-mix(in srgb, var(--color-gold-400) 12%, transparent)',
            border: '1px solid var(--color-gold-700)',
            color: 'var(--color-gold-300)',
          }}
        >
          {(post.profiles?.display_name ?? post.profiles?.username ?? '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium" style={{ color: 'var(--color-cream-200)' }}>
            {post.profiles?.display_name ?? post.profiles?.username ?? '削除済みユーザー'}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
            {timeAgo(post.created_at)}
          </p>
        </div>
        {/* 自分の投稿バッジ */}
        {post.user_id === userId && (
          <span className="badge-gold text-xs">自分</span>
        )}
      </div>

      {/* 本文 */}
      <p className="mb-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-cream-300)' }}>
        {post.content}
      </p>

      {/* 写真 */}
      {post.photos && post.photos.length > 0 && (
        <div
          className={`mb-4 grid gap-2 ${
            post.photos.length === 1 ? 'grid-cols-1' :
            post.photos.length === 2 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}
        >
          {post.photos.slice(0, 4).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt=""
              className={`w-full rounded-lg object-cover ${
                post.photos!.length === 1 ? 'aspect-video' : 'aspect-square'
              } ${post.photos!.length === 3 && i === 0 ? 'col-span-2' : ''}`}
            />
          ))}
        </div>
      )}

      {/* アクション */}
      <div className="flex items-center gap-5" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
        <button
          onClick={() => onLike(post.id, post.likes_count)}
          className="flex items-center gap-1.5 text-xs transition-all"
          style={{ color: 'var(--color-text-subtle)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#c0614a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-subtle)')}
        >
          <Heart className="h-3.5 w-3.5" />
          <span>{post.likes_count}</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{post.comments_count}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function BreedFeed({ breed, userId, initialPosts }: BreedFeedProps) {
  const { posts, connected } = useBreedFeed(breed, initialPosts as Post[])
  const { toggle } = useLike()

  const handleLike = (postId: string, currentLikes: number) => {
    toggle(postId, currentLikes, userId)
  }

  return (
    <div>
      {/* 接続状態バッジ */}
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: connected ? '#6da96d' : 'var(--color-text-subtle)' }}>
          {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {connected ? 'リアルタイム接続中' : '接続中...'}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="card-luxury flex flex-col items-center justify-center py-16 text-center">
          <PawPrint className="mb-4 h-10 w-10 opacity-20" style={{ color: 'var(--color-gold-400)' }} />
          <p className="mb-2 text-lg font-light" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)' }}>
            まだ投稿がありません
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>最初の投稿者になりましょう！</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {(posts as PostWithProfile[]).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                userId={userId}
                onLike={handleLike}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
