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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Estado para guardar a mensagem de erro

  const pushMsg = useCallback((msg: Msg) => {
    setMessages(prev => [...prev, msg])
  }, [])

  useEffect(() => {
    async function loadChat() {
      try {
        const res = await fetch('/api/client/chat')
        if (!res.ok) {
          throw new Error(`Falha ao carregar dados do chat (status: ${res.status})`)
        }
        const data: ChatData = await res.json()

        setMessages(data.messages || [])
        setChatId(data.chat_id)
        setChatStatus(data.status)

        if (data.status === 'pending_tree') {
          const treeRes = await fetch('/api/decision-tree/root')
          if (!treeRes.ok) {
            const errorData = await treeRes.json();
            throw new Error(errorData.error || `Falha ao carregar árvore de decisões (status: ${treeRes.status})`)
          }
          const rootQuestion = await treeRes.json()
          setCurrentQuestion(rootQuestion)
        }
      } catch (e: any) {
        // Agora, se um erro acontecer, ele será capturado e exibido na tela.
        setError(e.message)
        console.error("Erro detalhado ao carregar chat:", e)
      } finally {
        // O finally garante que o loading sempre terminará, mesmo em caso de erro.
        setLoading(false)
      }
    }
    loadChat()
  }, [])

  useCableChat(chatId, pushMsg)

  async function handleOptionClick(option: Option) {
    if (!currentQuestion) return

    const newHistory = [...treeHistory, `${currentQuestion.content}`, `> ${option.content}`]
    setTreeHistory(newHistory)
    
    const userChoiceMsg: Msg = {
      id: Date.now(),
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
       const botFinalMsg: Msg = {
        id: Date.now() + 1,
        content: 'Entendido. Agora, por favor, descreva sua dúvida em detalhes para que possamos analisar seu caso.',
        sender_type: 'ia',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, botFinalMsg])
      setChatStatus('ongoing')
    }
  }

  async function sendMessage(content: string) {
    if(!chatId) throw new Error("Chat ID não encontrado")

    const fullContent = chatStatus === 'pending_tree'
      ? [...treeHistory, `Dúvida: ${content}`].join('\n\n')
      : content;
    
    const res = await fetch('/api/client/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { content: fullContent } })
    });

    if (chatStatus === 'pending_tree') {
        setChatStatus('ongoing');
    }

    return res.json();
  }

  if (loading) return <main className="p-6">Carregando atendimento...</main>
  if (error) return <main className="p-6 text-red-600">Erro ao carregar o chat: {error}</main>

  return (
    <ChatWindow
      title="Atendimento"
      messages={messages}
      onSendMessage={sendMessage}
      interactiveQuestion={currentQuestion}
      onOptionClick={handleOptionClick}
      isInputLocked={chatStatus === 'pending_tree'}
    />
  )
}