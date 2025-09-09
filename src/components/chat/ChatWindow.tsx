'use client'
import { useEffect, useMemo, useRef, useState, FormEvent } from 'react'

// Nossos tipos de dados
export type Msg = { id: number; content: string; sender_type: 'client' | 'user' | 'ia'; created_at: string }
export type Option = { id: number; content: string; next_question_id: number | null }
export type Question = { id: number; content: string; options: Option[] }

// Props atualizadas e simplificadas
type Props = {
  title: string
  messages: Msg[] // Recebe a lista de mensagens completa
  onSendMessage: (content: string) => Promise<void> // Função para enviar mensagem
  isLoading?: boolean
  
  // Props para o fluxo da árvore de decisões
  interactiveQuestion?: Question | null
  onOptionClick?: (option: Option) => void
  isInputLocked?: boolean
}

export default function ChatWindow({
  title,
  messages,
  onSendMessage,
  isLoading = false,
  interactiveQuestion,
  onOptionClick,
  isInputLocked = false,
}: Props) {
  const [isSending, setIsSending] = useState(false)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Scroll para o fim sempre que as mensagens ou a pergunta interativa mudarem
  useEffect(() => {
    boxRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' })
  }, [messages, interactiveQuestion])

  // Função para lidar com o envio do formulário
  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (isSending || !inputRef.current?.value) return
    
    const content = inputRef.current.value
    inputRef.current.value = ''
    
    setIsSending(true)
    try {
      await onSendMessage(content)
    } catch (error) {
      console.error("Falha ao enviar mensagem:", error)
      // Opcional: retornar a mensagem ao input se falhar
      if(inputRef.current) inputRef.current.value = content;
    } finally {
      setIsSending(false)
    }
  }

  const badge = useMemo(() => ({
    client: 'self-end bg-blue-600 text-white',
    user: 'self-start bg-slate-100 text-slate-900',
    ia: 'self-start bg-zinc-900 text-white',
  }), [])

  return (
    <div className="flex h-[calc(100vh-120px)] w-full max-w-3xl flex-col rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between rounded-t-2xl border-b px-5 py-3">
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>

      <div ref={boxRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {isLoading && <p>Carregando...</p>}
        {/* Renderiza mensagens normais */}
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col">
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ${badge[m.sender_type]}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
            <span className="mt-1 self-start text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</span>
          </div>
        ))}

        {/* Renderiza a pergunta interativa */}
        {interactiveQuestion && (
          <div className="flex flex-col">
            <div className="max-w-[80%] self-start rounded-2xl bg-zinc-900 px-3 py-2 text-sm text-white shadow">
              <p className="whitespace-pre-wrap">{interactiveQuestion.content}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(interactiveQuestion.options || []).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onOptionClick && onOptionClick(opt)}
                  className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-white hover:bg-zinc-700"
                >
                  {opt.content}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Formulário de input condicional */}
      <div className="border-t p-3">
        {isInputLocked ? (
          <div className="text-center text-sm text-gray-500">
            {interactiveQuestion ? 'Por favor, selecione uma das opções acima.' : 'Aguarde...'}
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <input ref={inputRef} className="flex-1 rounded-xl border px-3 py-2 outline-none" placeholder="Digite sua mensagem…" disabled={isSending} />
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white" disabled={isSending}>
              {isSending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}