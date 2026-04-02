import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/** ブラウザ（Client Components）用 Supabase クライアント */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
