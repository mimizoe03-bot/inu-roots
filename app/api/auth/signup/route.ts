import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/** メール確認不要でユーザー登録するAPI */
export async function POST(req: NextRequest) {
  const { email, password, username, display_name } = await req.json() as {
    email: string
    password: string
    username: string
    display_name: string
  }

  // Service roleクライアントでAdmin APIを使用
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // メール確認済みでユーザーを作成
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, display_name },
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ user: data.user })
}
