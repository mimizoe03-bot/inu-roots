'use client'

import { useState } from 'react'
import { PawPrint, ChevronDown } from 'lucide-react'
import ChatWindow from '@/components/chat/ChatWindow'
import type { Dog } from '@/lib/supabase/types'

interface ChatPageClientProps {
  dogs: Pick<Dog, 'id' | 'name' | 'breed' | 'photo_url' | 'ai_portrait_url' | 'gender' | 'birth_date'>[]
}

export default function ChatPageClient({ dogs }: ChatPageClientProps) {
  const [selectedDogId, setSelectedDogId] = useState<string | null>(
    dogs.length > 0 ? dogs[0].id : null,
  )

  const selectedDog = dogs.find((d) => d.id === selectedDogId) ?? null

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:h-[calc(100vh-2rem)]">
      {/* ページヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
            AI Consultation
          </p>
          <h1
            className="text-2xl font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            お悩み相談室
          </h1>
        </div>

        {/* 愛犬セレクター */}
        {dogs.length > 0 && (
          <div className="relative">
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              {selectedDog?.photo_url || selectedDog?.ai_portrait_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedDog.ai_portrait_url ?? selectedDog.photo_url ?? ''}
                  alt={selectedDog.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: 'var(--color-surface-2)' }}
                >
                  <PawPrint className="h-3 w-3" style={{ color: 'var(--color-gold-600)' }} />
                </div>
              )}
              <select
                value={selectedDogId ?? ''}
                onChange={(e) => setSelectedDogId(e.target.value || null)}
                className="appearance-none bg-transparent pr-6 text-sm outline-none"
                style={{ color: 'var(--color-cream-200)' }}
              >
                <option value="">愛犬を選択...</option>
                {dogs.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none h-3.5 w-3.5" style={{ color: 'var(--color-text-subtle)' }} />
            </div>
          </div>
        )}
      </div>

      <div className="divider-gold mb-4" />

      {/* チャットウィンドウ */}
      <div className="flex-1 min-h-0">
        <ChatWindow selectedDog={selectedDog as Dog | null} />
      </div>
    </div>
  )
}
