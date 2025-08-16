'use client'
import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

type Msg = { id:number; content:string; sender_type:'client'|'user'|'ia'; created_at:string }

export default function ChatWindow({
  fetchMessages,               // () => Promise<Msg[]>
  sendMessage,                 // (content:string) => Promise<Msg>
  title,
}:{ 
  fetchMessages:()=>Promise<Msg[]>;
  sendMessage:(content:string)=>Promise<Msg>;
  title:string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [loaded, setLoaded] = useState(false)     // <- controla 1º carregamento
  const [error, setError] = useState<string|null>(null)
  const [sending, setSending] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    setLoaded(false)
    setError(null)

    ;(async () => {
      try {
        const data = await fetchMessages()
        if (!alive) return
        setMsgs(data)
      } catch (e:any) {
        if (!alive) return
        setError(e?.message ? `Falha ao carregar mensagens (${e.message})` : 'Falha ao carregar mensagens')
      } finally {
        if (!alive) return
        setLoaded(true)
        queueMicrotask(() => boxRef.current?.scrollTo({ top: 9e9, behavior: 'auto' }))
      }
    })()

    return () => { alive = false }
  }, [fetchMessages])

  async function handleSend(t: string) {
    if (!t.trim()) return
    setSending(true)
    try {
      const saved = await sendMessage(t)
      setMsgs(m => [...m, saved])
      queueMicrotask(() => boxRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' }))
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="p-6 flex flex-col h-[calc(100vh-64px)]">
      <h1 className="text-lg font-semibold mb-3">{title}</h1>

      <div
        ref={boxRef}
        className="flex-1 overflow-y-auto space-y-2 border rounded p-3 bg-gray-50 flex flex-col"
      >
        {!loaded && (
          <div className="text-sm text-gray-600">Carregando mensagens...</div>
        )}

        {loaded && error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        {loaded && !error && msgs.length === 0 && (
          <div className="text-sm text-gray-600">Nenhuma mensagem ainda.</div>
        )}

        {loaded && !error && msgs.length > 0 && msgs.map(m => (
          <MessageBubble key={m.id} from={m.sender_type} text={m.content} />
        ))}
      </div>

      {/* Input só aparece após carregar (independente de haver 0 mensagens) */}
      {loaded && !error && (
        <>
          <div className="my-3" />
          <MessageInput onSend={handleSend} disabled={sending} />
        </>
      )}
    </main>
  )
}
