'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/lib/supabase/types'

/** 犬種別リアルタイムフィード */
export function useBreedFeed(breed: string, initialPosts: Post[] = []) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // リアルタイム購読
    const channel = supabase
      .channel(`breed:${breed}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `breed=eq.${breed}`,
        },
        (payload) => {
          setPosts((prev) => [payload.new as Post, ...prev])
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `breed=eq.${breed}`,
        },
        (payload) => {
          setPosts((prev) =>
            prev.map((p) => (p.id === payload.new.id ? (payload.new as Post) : p)),
          )
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((prev) => prev.filter((p) => p.id !== payload.old.id))
        },
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [breed])

  return { posts, connected }
}

/** いいねのトグル */
export function useLike() {
  const toggle = useCallback(async (postId: string, currentLikes: number, userId: string) => {
    const supabase = createClient()
    // シンプル実装：likesテーブルなしでカウントのみ更新
    await supabase
      .from('posts')
      .update({ likes_count: currentLikes + 1 })
      .eq('id', postId)
  }, [])

  return { toggle }
}
