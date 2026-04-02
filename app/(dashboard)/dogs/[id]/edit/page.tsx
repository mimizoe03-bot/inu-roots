import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DogEditForm from '@/components/dogs/DogEditForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata = { title: '愛犬を編集' }

export default async function DogEditPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: dog } = await supabase.from('dogs').select('*').eq('id', id).single()
  if (!dog) notFound()
  if (dog.owner_id !== user?.id) redirect('/dogs')

  const { data: pedigree } = await supabase
    .from('pedigree_records')
    .select('*')
    .eq('dog_id', id)
    .single()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/dogs/${id}`}
          className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          プロフィールに戻る
        </Link>
        <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
          Edit
        </p>
        <h1 className="text-3xl font-light" style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}>
          {dog.name}を編集
        </h1>
      </div>

      <div className="divider-gold mb-8" />

      <DogEditForm dog={dog} pedigree={pedigree} />
    </div>
  )
}
