'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Dog } from '@/lib/supabase/types'

/** ログインユーザーの愛犬一覧を取得・管理するフック */
export function useDogs() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      const { data, error: fetchError } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setDogs(data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDogs()
  }, [fetchDogs])

  return { dogs, loading, error, refetch: fetchDogs }
}

/** 特定の犬の情報を取得するフック */
export function useDog(dogId: string) {
  const [dog, setDog] = useState<Dog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!dogId) return

    const supabase = createClient()
    supabase
      .from('dogs')
      .select('*')
      .eq('id', dogId)
      .single()
      .then(({ data }) => {
        setDog(data)
        setLoading(false)
      })
  }, [dogId])

  return { dog, loading }
}
