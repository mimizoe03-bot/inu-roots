'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, PawPrint, Stethoscope, RefreshCw } from 'lucide-react'
import type { Dog } from '@/lib/supabase/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWindowProps {
  selectedDog: Dog | null
}

/* マークダウン風のシンプルなレンダリング */
function MessageContent({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed" style={{ color: 'inherit' }}>
      {content.split('\n').map((line, i) => {
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2 my-0.5">
              <span style={{ color: 'var(--color-gold-500)' }}>·</span>
              <span>{line.slice(2)}</span>
            </div>
          )
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold my-1">{line.slice(2, -2)}</p>
        }
        if (line === '') return <br key={i} />
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

/* 入力中インジケーター */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: 'color-mix(in srgb, var(--color-gold-400) 12%, transparent)', border: '1px solid var(--color-gold-700)' }}
      >
        <Stethoscope className="h-3.5 w-3.5" style={{ color: 'var(--color-gold-400)' }} />
      </div>
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: 'var(--color-gold-500)',
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ChatWindow({ selectedDog }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 最下部にスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || streaming) return

    const userMessage: Message = { role: 'user', content: trimmed }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    // テキストエリアの高さをリセット
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const dogInfo = selectedDog
        ? {
          name: selectedDog.name,
          breed: selectedDog.breed,
          age: selectedDog.birth_date
            ? Math.floor((Date.now() - new Date(selectedDog.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365))
            : undefined,
          gender: selectedDog.gender ?? undefined,
        }
        : undefined

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, dogInfo }),
      })

      if (!res.ok) throw new Error('APIエラー')
      if (!res.body) throw new Error('ストリームなし')

      // ストリーミング読み取り
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        // Anthropic ストリーミング形式をパース
        const lines = chunk.split('\n').filter(Boolean)
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as {
                type: string
                delta?: { type: string; text: string }
              }
              if (data.type === 'content_block_delta' && data.delta?.text) {
                assistantContent += data.delta.text
                setMessages((prev) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                  return updated
                })
              }
            } catch {
              // JSONパースエラーは無視
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '申し訳ありません。エラーが発生しました。もう一度お試しください。' },
      ])
    } finally {
      setStreaming(false)
    }
  }, [input, messages, selectedDog, streaming])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // 自動リサイズ
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  const clearChat = () => {
    setMessages([])
    setInput('')
  }

  return (
    <div
      className="flex h-full flex-col rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'color-mix(in srgb, var(--color-gold-400) 12%, transparent)', border: '1px solid var(--color-gold-700)' }}
          >
            <Stethoscope className="h-4 w-4" style={{ color: 'var(--color-gold-400)' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-cream-200)' }}>
              いぬルーツ相談室
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
              {selectedDog ? `${selectedDog.name}について相談中` : 'AIによる犬の健康・お悩み相談'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: 'var(--color-text-subtle)' }}
          >
            <RefreshCw className="h-3 w-3" />
            クリア
          </button>
        )}
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'color-mix(in srgb, var(--color-gold-400) 8%, transparent)' }}
            >
              <PawPrint className="h-7 w-7" style={{ color: 'var(--color-gold-600)' }} />
            </div>
            <p
              className="mb-2 text-lg font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-200)' }}
            >
              なんでもお気軽にご相談ください
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              健康・しつけ・食事・生活など、愛犬に関することなら何でも。
            </p>
            {/* クイック質問 */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                '食欲がないのですが大丈夫でしょうか？',
                'ワクチン接種のタイミングを教えて',
                '子犬のトイレトレーニング方法は？',
                '散歩の適切な時間と頻度は？',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus() }}
                  className="rounded-full px-3 py-1.5 text-xs transition-colors"
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* アバター */}
              {msg.role === 'assistant' && (
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--color-gold-400) 12%, transparent)', border: '1px solid var(--color-gold-700)' }}
                >
                  <Stethoscope className="h-3.5 w-3.5" style={{ color: 'var(--color-gold-400)' }} />
                </div>
              )}

              {/* バブル */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'rounded-br-sm'
                    : 'rounded-bl-sm'
                }`}
                style={
                  msg.role === 'user'
                    ? {
                      background: 'linear-gradient(135deg, var(--color-gold-600), var(--color-gold-500))',
                      color: 'var(--color-ink-950)',
                    }
                    : {
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-cream-200)',
                    }
                }
              >
                <MessageContent content={msg.content} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {streaming && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <div
        className="p-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div
          className="flex items-end gap-3 rounded-xl p-3"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力（Shift+Enterで改行）"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none"
            style={{
              color: 'var(--color-text)',
              maxHeight: '160px',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-40"
            style={{
              background: input.trim() && !streaming
                ? 'linear-gradient(135deg, var(--color-gold-600), var(--color-gold-400))'
                : 'var(--color-border)',
              color: input.trim() && !streaming ? 'var(--color-ink-950)' : 'var(--color-text-subtle)',
            }}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs" style={{ color: 'var(--color-text-subtle)' }}>
          ※ 深刻な症状は必ず動物病院へ。このAIは医療行為を行いません。
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
