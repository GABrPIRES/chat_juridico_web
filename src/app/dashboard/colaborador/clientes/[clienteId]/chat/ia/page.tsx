'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import ChatWindow from '@/components/chat/ChatWindow'

type Chat = { id:number; client_id:number; chat_type:'cliente'|'ia' }
type Msg = { id:number; content:string; sender_type:'client'|'user'|'ia'; created_at:string }

export default function ChatIAColab() {
  const params = useParams()
  const clienteId = useMemo(() => {
    const v = (params as any)?.clienteId
    if (!v) return ''
    return Array.isArray(v) ? v[0] : String(v)
  }, [params])

  const [chatId, setChatId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clienteId) return
    console.log('[ChatIA] clienteId =', clienteId)

    fetch(`/api/user/clients/client/${clienteId}/chats`, { cache:'no-store' })
      .then(async r => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json() as Promise<Chat[]>
      })
      .then(list => {
        const c = list.find(x => x.chat_type === 'ia')
        if (!c) throw new Error('Chat tipo "ia" não encontrado')
        setChatId(c.id)
      })
      .catch(e => setError(`Falha ao obter chat IA (${e.message})`))
  }, [clienteId])

  const fetchMessages = useMemo(() => {
    return async (): Promise<Msg[]> => {
      if (!chatId || !clienteId) return []
      const r = await fetch(`/api/user/clients/client/${clienteId}/chats/${chatId}/messages`, { cache:'no-store' })
      if (!r.ok) throw new Error(String(r.status))
      return r.json()
    }
  }, [clienteId, chatId])

  const sendMessage = useMemo(() => {
    return async (content: string): Promise<Msg> => {
      if (!chatId || !clienteId) throw new Error('Chat não inicializado')
      const r = await fetch(`/api/user/clients/client/${clienteId}/chats/${chatId}/messages`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ content, sender_type:'user' }),
      })
      if (!r.ok) throw new Error(String(r.status))
      return r.json()
    }
  }, [clienteId, chatId])

  if (!clienteId) return <div className="p-6">Obtendo cliente...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!chatId) return <div className="p-6">Carregando chat IA...</div>

  return <ChatWindow title="Chat IA" fetchMessages={fetchMessages} sendMessage={sendMessage} />
}
