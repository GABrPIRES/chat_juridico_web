'use client'
import { useEffect, useState, FormEvent } from 'react'

type Option = { id: number; content: string; next_question_id: number | null }
type Question = { id: number; content: string; is_root: boolean; options: Option[] }

export default function ArvoreDecisaoPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState('')
  const [newOption, setNewOption] = useState<{ [key: number]: string }>({})

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/decision-tree')
      if (!res.ok) throw new Error('Falha ao carregar a árvore')
      const data = await res.json()
      if (Array.isArray(data)) {
        setQuestions(data)
      } else {
        setQuestions([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleCreateQuestion(e: FormEvent) {
    e.preventDefault()
    const isRoot = !questions.some(q => q.is_root)
    await fetch('/api/decision-tree/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: { content: newQuestion, is_root: isRoot } }),
    })
    setNewQuestion('')
    fetchData()
  }

  async function handleAddOption(e: FormEvent, questionId: number) {
    e.preventDefault()
    const content = newOption[questionId]
    if (!content) return

    await fetch(`/api/decision-tree/questions/${questionId}/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: { content } }),
    })
    setNewOption({ ...newOption, [questionId]: '' })
    fetchData()
  }

  // NOVA FUNÇÃO para atualizar o link de uma opção
  async function handleLinkOption(optionId: number, nextQuestionId: string) {
    const next_question_id = nextQuestionId ? parseInt(nextQuestionId) : null

    await fetch(`/api/decision-tree/options/${optionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: { next_question_id } }),
    })
    fetchData()
  }

  if (loading) return <main className="p-6">Carregando...</main>

  // Filtra as perguntas que podem ser selecionadas (não pode ser a pergunta atual)
  const availableQuestions = (currentQuestionId: number) => {
    return questions.filter(q => q.id !== currentQuestionId)
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Gerenciar Árvore de Decisões</h1>
      
      {/* Formulário para criar nova pergunta */}
      <form onSubmit={handleCreateQuestion} className="mb-8 p-4 border rounded-lg bg-white">
        {/* ... (código do formulário de pergunta continua o mesmo) */}
        <h2 className="font-semibold mb-2">Adicionar Nova Pergunta</h2>
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Digite o conteúdo da pergunta..."
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
          Salvar Pergunta
        </button>
      </form>

      {/* Lista de perguntas existentes */}
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="p-4 border rounded-lg bg-white shadow-sm">
            <p className="font-bold">
              {q.is_root && <span className="text-xs bg-green-200 text-green-800 p-1 rounded mr-2">INÍCIO</span>}
              (ID: {q.id}) {q.content}
            </p>
            <div className="pl-4 mt-4">
              <h3 className="font-semibold text-sm mb-2">Opções de Resposta:</h3>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-4 p-2 border-b">
                    <span className="flex-1">{opt.content}</span>
                    <span className="text-gray-500">Leva para:</span>
                    <select
                      value={opt.next_question_id || ''}
                      onChange={(e) => handleLinkOption(opt.id, e.target.value)}
                      className="border p-1 text-sm rounded"
                    >
                      <option value="">-- Finaliza o Fluxo --</option>
                      {availableQuestions(q.id).map(nextQ => (
                        <option key={nextQ.id} value={nextQ.id}>
                          (ID: {nextQ.id}) {nextQ.content.substring(0, 50)}...
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {/* Formulário para adicionar nova opção */}
              <form onSubmit={(e) => handleAddOption(e, q.id)} className="mt-4">
                <input
                  value={newOption[q.id] || ''}
                  onChange={(e) => setNewOption({ ...newOption, [q.id]: e.target.value })}
                  placeholder="Nova opção de resposta..."
                  className="border p-1 text-sm rounded"
                  required
                />
                <button type="submit" className="ml-2 bg-gray-200 text-sm px-3 py-1 rounded">
                  Adicionar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}