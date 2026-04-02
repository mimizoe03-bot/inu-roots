import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BreedPostForm from '@/components/community/BreedPostForm'
import BreedFeed from '@/components/community/BreedFeed'

interface PageProps {
  params: Promise<{ breed: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { breed } = await params
  return { title: `${decodeURIComponent(breed)}コミュニティ` }
}

export default async function BreedCommunityPage({ params }: PageProps) {
  const { breed: encodedBreed } = await params
  const breed = decodeURIComponent(encodedBreed)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, profiles(username, display_name)')
    .eq('breed', breed)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href="/community"
          className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          コミュニティ一覧
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
              Community
            </p>
            <h1 className="text-2xl font-light" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}>
              {breed}
            </h1>
          </div>
          <span className="badge-gold">{posts?.length ?? 0}件</span>
        </div>
      </div>

      <div className="divider-gold mb-6" />

      {/* 投稿フォーム */}
      <div className="mb-6">
        <BreedPostForm breed={breed} userId={user!.id} />
      </div>

      {/* リアルタイムフィード */}
      <BreedFeed
        breed={breed}
        userId={user!.id}
        initialPosts={(posts ?? []) as Parameters<typeof BreedFeed>[0]['initialPosts']}
      />
    </div>
  )
}
