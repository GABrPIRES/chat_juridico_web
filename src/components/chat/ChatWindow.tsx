'use client'
import { useCallback, useEffect, useMemo, useRef, useState, FormEvent } from 'react'

// Nossos tipos de dados
export type Msg = { id: number; content: string; sender_type: 'client' | 'user' | 'ia'; created_at: string }
export type Option = { id: number; content: string; next_question_id: number | null }
export type Question = { id: number; content: string; options: Option[] }

// O ChatWindow agora pode receber uma pergunta interativa
type Props = {
  title: string
  initialMessages?: Msg[]
  sendMessage: (content: string) => Promise<Msg>
  onRegisterPush?: (fn: (m: Msg) => void) => void
  interactiveQuestion?: Question | null
  onOptionClick?: (option: Option) => void
  isLocked?: boolean
}

export default function ChatWindow({
  title,
  initialMessages = [],
  sendMessage,
  onRegisterPush,
  interactiveQuestion,
  onOptionClick,
  isLocked = false,
}: Props) {
  const [msgs, setMsgs] = useState<Msg[]>(initialMessages)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setMsgs(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    boxRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' })
  }, [msgs.length, interactiveQuestion])

  useEffect(() => {
    if (!onRegisterPush) return
    const push = (m: Msg) => {
      setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
    }
    onRegisterPush(push)
  }, [onRegisterPush])

  const onSend = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (sending) return
    const value = inputRef.current?.value?.trim() ?? ''
    if (!value) return
    try {
      setSending(true)
      await sendMessage(value)
      if (inputRef.current) inputRef.current.value = ''
    } catch (e: any) {
      setError(`Falha ao enviar (${e?.message ?? 'erro'})`)
    } finally {
      setSending(false)
    }
  }, [sendMessage, sending])

  const badge = useMemo(() => ({
    client: 'self-end bg-blue-600 text-white',
    user: 'self-start bg-slate-100 text-slate-900',
    ia: 'self-start bg-zinc-900 text-white',
  }), [])

  return (
    <div className="flex h-[calc(100vh-120px)] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 px-5 py-3">
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>

      <div ref={boxRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {/* Renderiza mensagens normais */}
        {msgs.map((m) => (
          <div key={m.id} className="flex flex-col">
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ${badge[m.sender_type]}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
            <span className="mt-1 text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</span>
          </div>
        ))}

        {/* Renderiza a pergunta interativa como se fosse uma mensagem de bot */}
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
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
      
      {/* O formulário de input agora fica desabilitado durante o fluxo da árvore */}
      <div className="border-t border-slate-200 p-3">
        {isLocked ? (
          <div className="text-center text-sm text-gray-500">
            {interactiveQuestion ? 'Por favor, selecione uma das opções acima para continuar.' : 'Aguarde...'}
          </div>
        ) : (
          <form onSubmit={onSend} className="flex gap-2">
            <input ref={inputRef} className="flex-1 rounded-xl border border-slate-300 px-3 py-2 outline-none" placeholder="Digite sua mensagem…" disabled={sending} />
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white" disabled={sending}>
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}