import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export const metadata = { title: '設定' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <SettingsClient profile={profile} userEmail={user?.email ?? ''} />
}
