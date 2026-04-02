import type { Metadata } from 'next'
import { Noto_Sans_JP, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'いぬルーツ — 愛犬の家系を、未来へ。',
    template: '%s | いぬルーツ',
  },
  description: '血統書から家系を登録・可視化し、愛犬の物語をつむぐプレミアムプラットフォーム。',
  keywords: ['犬', '血統書', '家系図', 'ペット', 'ドッグラン', '手作りドッグフード'],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'いぬルーツ',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${cormorant.variable}`}>
      <body
        className="min-h-screen antialiased"
        style={{
          fontFamily: 'var(--font-noto), var(--font-sans)',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text)',
        }}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            },
          }}
        />
      </body>
    </html>
  )
}
