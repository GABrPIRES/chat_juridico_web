'use client'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ChatWindow, { type Msg } from '@/components/chat/ChatWindow'
import { useCableChat } from '@/lib/useCableChat'

type Chat = { id: number; client_id: number; chat_type: 'cliente' | 'ia' }

export default function ChatClienteColab() {
  const params = useParams() as { clienteId: string }
  const clienteId = params.clienteId

  const [messages, setMessages] = useState<Msg[]>([])
  const [chatId, setChatId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Adiciona novas mensagens (vindas do WebSocket) à lista
  const pushMsg = useCallback((msg: Msg) => {
    setMessages(prev => {
      if (prev.find(m => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  // Busca os dados iniciais do chat
  useEffect(() => {
    if (!clienteId) return
    async function loadChat() {
      try {
        const rChats = await fetch(`/api/user/clients/client/${clienteId}/chats`)
        if (!rChats.ok) throw new Error(`Status: ${rChats.status}`)
        const chats: Chat[] = await rChats.json()
        const c = chats.find(x => x.chat_type === 'cliente')
        if (!c) throw new Error('Chat do tipo "cliente" não encontrado')

        const rMsgs = await fetch(`/api/user/clients/client/${clienteId}/chats/${c.id}/messages`)
        if (!rMsgs.ok) throw new Error(`Status: ${rMsgs.status}`)
        const msgs: Msg[] = await rMsgs.json()

        setChatId(c.id)
        setMessages(msgs)
      } catch (e: any) {
        setError(`Falha ao preparar o chat: ${e.message}`)
      } finally {
        setLoading(false)
      }
    }
    loadChat()
  }, [clienteId])

  // Conecta ao WebSocket para receber mensagens em tempo real
  useCableChat(chatId, pushMsg)

  // Função para ENVIAR uma nova mensagem
  const handleSendMessage = async (content: string) => {
    if (!clienteId || !chatId) throw new Error('Chat não inicializado')
    const res = await fetch(`/api/user/clients/client/${clienteId}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { content } }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Falha ao enviar mensagem')
    }
    // A mensagem enviada será recebida de volta via WebSocket, atualizando a UI
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <ChatWindow
      title="Chat com Cliente"
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={loading}
    />
  )
}