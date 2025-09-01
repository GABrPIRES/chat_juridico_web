'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import ChatWindow, { type Msg } from '@/components/chat/ChatWindow'
import { useCableChat } from '@/lib/useCableChat'

type Chat = { id:number; client_id:number; chat_type:'cliente'|'ia' }

export default function ChatIaColab() {
  const params = useParams() as Record<string, string | string[] | undefined>

  // aceita [clienteId] OU [id]
  const clienteId = useMemo(() => {
    const raw = params?.clienteId ?? params?.id
    if (!raw) return ''
    return Array.isArray(raw) ? raw[0] : raw
  }, [params])

  const [chatId, setChatId] = useState<number | null>(null)
  const [seed, setSeed]     = useState<Msg[] | null>(null)
  const [error, setError]   = useState<string | null>(null)

  const [pushMsg, setPushMsg] = useState<((m: Msg) => void) | null>(null)
  const registerPush = useCallback((fn: (m: Msg) => void) => {
    setPushMsg(() => fn)
  }, [])

  useEffect(() => {
    if (!clienteId) return
    let alive = true
    ;(async () => {
      try {
        const rChats = await fetch(`/api/user/clients/client/${clienteId}/chats`, { cache: 'no-store' })
        if (!rChats.ok) throw new Error(String(rChats.status))
        const chats: Chat[] = await rChats.json()
        const c = chats.find(x => x.chat_type === 'ia')
        if (!c) throw new Error('Chat tipo "ia" não encontrado')

        const rMsgs = await fetch(`/api/user/clients/client/${clienteId}/chats/${c.id}/messages`, { cache: 'no-store' })
        if (!rMsgs.ok) throw new Error(String(rMsgs.status))
        const msgs: Msg[] = await rMsgs.json()

        if (!alive) return
        setChatId(c.id)
        setSeed(msgs)
      } catch (e:any) {
        if (!alive) return
        setError(`Falha ao preparar chat IA (${e?.message ?? 'erro'})`)
      }
    })()
    return () => { alive = false }
  }, [clienteId])

  const onReceive = useCallback((m: any) => {
    if (!pushMsg) return
    const msg: Msg = { id: m.id, content: m.content, sender_type: m.sender_type, created_at: m.created_at }
    pushMsg(msg)
  }, [pushMsg])

  useCableChat(chatId, onReceive)

  const fetchMessages = useMemo(() => {
    return async (): Promise<Msg[]> => {
      if (!clienteId || !chatId) return []
      const r = await fetch(`/api/user/clients/client/${clienteId}/chats/${chatId}/messages`, { cache: 'no-store' })
      if (!r.ok) throw new Error(String(r.status))
      return r.json()
    }
  }, [clienteId, chatId])

  const sendMessage = useMemo(() => {
    return async (content: string): Promise<Msg> => {
      if (!clienteId || !chatId) throw new Error('Chat não inicializado')
      const r = await fetch(`/api/user/clients/client/${clienteId}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // IA responderá no backend e virá por Cable
        body: JSON.stringify({ content }),
      })
      if (!r.ok) throw new Error(String(r.status))
      return r.json()
    }
  }, [clienteId, chatId])

  if (!clienteId) return <div className="p-6">Obtendo cliente…</div>
  if (error)      return <div className="p-6 text-red-600">{error}</div>
  if (!chatId || !seed) return <div className="p-6">Carregando chat IA…</div>

  return (
    <ChatWindow
      title="Chat com IA"
      initialMessages={seed}
      fetchMessages={fetchMessages}
      sendMessage={sendMessage}
      onRegisterPush={registerPush}
    />
  )
}
