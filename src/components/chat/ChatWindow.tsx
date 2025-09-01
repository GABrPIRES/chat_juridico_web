'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type Msg = {
  id: number
  content: string
  sender_type: 'client' | 'user' | 'ia'
  created_at: string
}

type Props = {
  title: string
  // REST
  fetchMessages: () => Promise<Msg[]>
  sendMessage: (content: string) => Promise<Msg>
  // Realtime
  initialMessages?: Msg[]
  onRegisterPush?: (fn: (m: Msg) => void) => void
}

export default function ChatWindow({
  title,
  fetchMessages,
  sendMessage,
  initialMessages,
  onRegisterPush,
}: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // hidrata pelos seeds (se vier) uma única vez
  useEffect(() => {
    if (!initialMessages) return
    setMsgs(initialMessages)
    setLoading(false)
  }, [initialMessages])

  // se não veio seed, busca via REST
  useEffect(() => {
    if (initialMessages) return
    let alive = true
    ;(async () => {
      try {
        const list = await fetchMessages()
        if (!alive) return
        setMsgs(list)
      } catch (e: any) {
        if (!alive) return
        setError(`Falha ao carregar mensagens (${e?.message ?? 'erro'})`)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [initialMessages, fetchMessages])

  // scroll pro fim quando as mensagens mudarem
  useEffect(() => {
    boxRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' })
  }, [msgs.length])

  // permitir “empurrar” mensagens vindas do websocket
  useEffect(() => {
    if (!onRegisterPush) return
    const push = (m: Msg) => {
      setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
    }
    onRegisterPush(push)
  }, [onRegisterPush])

  const onSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (sending) return
      const value = inputRef.current?.value?.trim() ?? ''
      if (!value) return
      try {
        setSending(true)
        const created = await sendMessage(value)
        // normalmente o broadcast vai trazer a msg; ainda assim, garanta não-duplicação:
        setMsgs((prev) => (prev.some((x) => x.id === created.id) ? prev : [...prev, created]))
        if (inputRef.current) inputRef.current.value = ''
      } catch (e: any) {
        setError(`Falha ao enviar (${e?.message ?? 'erro'})`)
      } finally {
        setSending(false)
      }
    },
    [sendMessage, sending]
  )

  const badge = useMemo(() => {
    return {
      client: 'bg-slate-100 text-slate-900',
      user: 'bg-blue-600 text-white',
      ia: 'bg-zinc-900 text-white',
    } as const
  }, [])

  return (
    <div className="flex h-[calc(100vh-120px)] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 px-5 py-3">
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>

      <div ref={boxRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-72 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
          </div>
        ) : (
          msgs.map((m) => (
            <div key={m.id} className="flex flex-col">
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ${badge[m.sender_type]}`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
              <span className="mt-1 text-xs text-slate-400">
                {new Date(m.created_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {/* input só aparece quando já carregou */}
      {!loading && (
        <form onSubmit={onSend} className="flex gap-2 border-t border-slate-200 p-3">
          <input
            ref={inputRef}
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-400"
            placeholder="Digite sua mensagem…"
            disabled={sending}
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={sending}
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  )
}
