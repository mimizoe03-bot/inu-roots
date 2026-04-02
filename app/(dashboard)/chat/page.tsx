import { createClient } from '@/lib/supabase/server'
import ChatPageClient from './ChatPageClient'

export const metadata = { title: 'お悩み相談' }

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ユーザーの愛犬リストを取得
  const { data: dogs } = await supabase
    .from('dogs')
    .select('id, name, breed, photo_url, ai_portrait_url, gender, birth_date')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  return <ChatPageClient dogs={dogs ?? []} />
}
