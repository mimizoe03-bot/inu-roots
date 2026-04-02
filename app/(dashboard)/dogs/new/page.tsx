import DogForm from '@/components/dogs/DogForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: '愛犬を追加' }

export default function NewDogPage() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* ページヘッダー */}
      <div className="mb-8">
        <Link
          href="/dogs"
          className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          一覧に戻る
        </Link>
        <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
          New Dog
        </p>
        <h1
          className="text-3xl font-light"
          style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
        >
          愛犬を追加する
        </h1>
      </div>

      <div className="divider-gold mb-8" />

      <DogForm />
    </div>
  )
}
