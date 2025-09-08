'use client'
import { useCallback, useEffect, useState } from 'react'
import ChatWindow, { type Msg, type Option, type Question } from '@/components/chat/ChatWindow'
import { useCableChat } from '@/lib/useCableChat'

type ChatData = { chat_id: number; messages: Msg[]; status: 'pending_tree' | 'ongoing' | 'closed' }

export default function ClienteChatPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [chatId, setChatId] = useState<number | null>(null)
  const [chatStatus, setChatStatus] = useState<'pending_tree' | 'ongoing' | 'closed'>('ongoing')
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [treeHistory, setTreeHistory] = useState<string[]>([])
  const [finalQuery, setFinalQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const pushMsg = useCallback((msg: Msg) => {
    setMessages(prev => [...prev, msg])
  }, [])

  useEffect(() => {
    async function loadChat() {
      const res = await fetch('/api/client/chat')
      const data: ChatData = await res.json()
      setMessages(data.messages)
      setChatId(data.chat_id)
      setChatStatus(data.status)

      if (data.status === 'pending_tree') {
        const treeRes = await fetch('/api/decision-tree/root')
        setCurrentQuestion(await treeRes.json())
      }
      setLoading(false)
    }
    loadChat()
  }, [])

  useCableChat(chatId, pushMsg)

  async function handleOptionClick(option: Option) {
    if (!currentQuestion) return

    const newHistory = [...treeHistory, `${currentQuestion.content}`, `> ${option.content}`]
    setTreeHistory(newHistory)
    
    // Adiciona a resposta do cliente à lista de mensagens para visualização
    const userChoiceMsg: Msg = {
      id: Date.now(), // ID temporário
      content: option.content,
      sender_type: 'client',
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userChoiceMsg])

    if (option.next_question_id) {
      const res = await fetch(`/api/decision-tree/questions/${option.next_question_id}`)
      setCurrentQuestion(await res.json())
    } else {
      setCurrentQuestion(null)
      // Simula uma mensagem do bot pedindo a dúvida final
       const botFinalMsg: Msg = {
        id: Date.now() + 1,
        content: 'Entendido. Agora, por favor, descreva sua dúvida em detalhes para que possamos analisar seu caso.',
        sender_type: 'ia', // ou 'user' se for um "assistente virtual"
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, botFinalMsg])
      setChatStatus('ongoing') // Libera o input de texto
    }
  }

  async function sendMessage(content: string) {
    if(!chatId) throw new Error("Chat ID não encontrado")
    // Futuramente, se o status for 'pending_tree' e o usuário digitar, podemos fazer algo.
    // Por enquanto, só funciona no modo 'ongoing'.
    const res = await fetch('/api/client/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { content } })
    });
    return res.json();
  }

  if (loading) return <main className="p-6">Carregando atendimento...</main>

  return (
    <ChatWindow
      title="Atendimento"
      initialMessages={messages}
      sendMessage={sendMessage}
      interactiveQuestion={currentQuestion}
      onOptionClick={handleOptionClick}
      isLocked={chatStatus === 'pending_tree'}
    />
  )
}