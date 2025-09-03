'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import ChatWindow from '@/components/chat/ChatWindow'
import { useCableChat } from '@/lib/useCableChat'

type Msg = { id:number; content:string; sender_type:'client'|'user'|'ia'; created_at:string }
type ChatShow = { chat_id?: number; messages?: Msg[]; client_status?: 'active' | 'inactive' } | Msg[]

export default function ClienteChatPage() {
  const [chatId, setChatId] = useState<number|null>(null)
  const [seed, setSeed] = useState<Msg[]|null>(null)
  const [error, setError] = useState<string|null>(null)

  const [clientStatus, setClientStatus] = useState<'active' | 'inactive'>('active')

  // Função para o ChatWindow registrar como empurrar mensagens recebidas em tempo real
  const [pushMsg, setPushMsg] = useState<((m:Msg)=>void) | null>(null)
  const registerPush = useCallback((fn: (m: Msg) => void) => {
    setPushMsg(() => fn)              // estável, evita loop
  }, [])

  // 1) Carrega mensagens atuais (e, se vier, o chat_id)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const rClient = await fetch('/api/client/me', { cache:'no-store' })
        if (!rClient.ok) throw new Error('Falha ao verificar status do cliente')
        const clientData = await rClient.json()
        if (!alive) return
        setClientStatus(clientData.status)

        // Se o cliente estiver inativo, não precisa carregar o chat
        if (clientData.status === 'inactive') {
          setSeed([]) // Define as mensagens como vazias para renderizar o aviso
          return;
        }

        const r = await fetch('/api/client/chat', { cache:'no-store' })
        if (!r.ok) throw new Error(String(r.status))
        const data: ChatShow = await r.json()
        if (!alive) return

        if (Array.isArray(data)) {
          setSeed(data)
        } else {
          setSeed(data.messages ?? [])
          if (typeof data.chat_id === 'number') setChatId(data.chat_id)
        }
      } catch (e:any) {
        if (!alive) return
        setError(`Falha ao carregar chat (${e?.message ?? 'erro'})`)
      }
    })()
    return () => { alive = false }
  }, [])

  // 2) Callback para chegada via Cable → empilha no ChatWindow
  const onReceive = useCallback((m: any) => {
    if (pushMsg) {
      const msg: Msg = { id: m.id, content: m.content, sender_type: m.sender_type, created_at: m.created_at }
      pushMsg(msg)
    }
  }, [pushMsg])

  // 3) Assina o canal quando tiver chatId
  useCableChat(chatId, onReceive)

  // 4) Fetchers REST usados pelo ChatWindow
  const fetchMessages = useMemo(() => {
    return async (): Promise<Msg[]> => {
      const r = await fetch('/api/client/chat', { cache:'no-store' })
      if (!r.ok) throw new Error(String(r.status))
      const data: ChatShow = await r.json()
      return Array.isArray(data) ? data : (data.messages ?? [])
    }
  }, [])

  const sendMessage = useMemo(() => {
    return async (content: string): Promise<Msg> => {
      const r = await fetch('/api/client/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!r.ok) throw new Error(String(r.status))
      return r.json()
    }
  }, [])

  if (error)   return <div className="p-6 text-red-600">{error}</div>
  if (!seed)   return <div className="p-6">Carregando chat...</div>

  return (
    <ChatWindow
      title="Atendimento"
      initialMessages={seed}
      fetchMessages={fetchMessages}
      sendMessage={sendMessage}
      onRegisterPush={registerPush}
      isLocked={clientStatus === 'inactive'} // <-- Nova prop
    />
  )
}
