'use client'
import { useEffect, useState, FormEvent } from 'react'
import { useCurrentUser } from '@/lib/useCurrentUser'

type User = { id: number; name: string; email: string; role: 'admin' | 'gerente' | 'assistente' }

export default function GerenciarUsuariosPage() {
  // State para a lista de usuários
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userId: currentUserId } = useCurrentUser()

  // State para o formulário de criação
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'assistente' | 'gerente' | 'admin'>('assistente')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Função para buscar usuários
  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Falha ao carregar usuários')
      const data = await res.json()
      setUsers(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Função para criar um novo usuário
  async function handleCreateUser(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
        const res = await fetch('/api/user/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Adicione 'phone' aqui
                user: { name, email, password, password_confirmation: password, role, phone },
            }),
        })

        if (!res.ok) {
        const err = await res.json()
        throw new Error(err.errors?.join(', ') || 'Erro desconhecido')
        }

        alert('Usuário criado com sucesso!')
        // Limpa o formulário e recarrega a lista
        setName('')
        setEmail('')
        setPassword('')
        setPhone('') // <-- Limpa o estado do telefone
        setRole('assistente')
        fetchUsers()
    } catch (e: any) {
      alert(`Erro ao criar usuário: ${e.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para excluir um usuário
  async function handleDeleteUser(userId: number) {
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Falha ao excluir usuário')
      }

      alert('Usuário excluído com sucesso!')
      // Remove o usuário da lista local
      setUsers(users.filter(u => u.id !== userId))
    } catch (e: any) {
      alert(`Erro: ${e.message}`)
    }
  }

  return (
    <main className="p-6 space-y-8">
      {/* Seção de Criação */}
      <section>
        <h1 className="text-xl font-bold mb-4">Criar Novo Usuário</h1>
        <form onSubmit={handleCreateUser} className="max-w-lg space-y-3 bg-white p-4 rounded-lg border">
          <input className="border px-3 py-2 rounded w-full" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />
          <input type="email" className="border px-3 py-2 rounded w-full" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" className="border px-3 py-2 rounded w-full" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
          <input className="border px-3 py-2 rounded w-full" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} required />
          <select value={role} onChange={e => setRole(e.target.value as any)} className="border px-3 py-2 rounded w-full">
            <option value="assistente">Assistente</option>
            <option value="gerente">Gerente</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Usuário'}
          </button>
        </form>
      </section>

      {/* Seção de Listagem e Exclusão */}
      <section>
        <h2 className="text-xl font-bold mb-4">Usuários Cadastrados</h2>
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-600">Erro: {error}</p>}
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="border rounded-lg p-4 flex items-center justify-between shadow-sm bg-white">
              <div>
                <p className="font-bold">{user.name} <span className="text-sm font-normal text-gray-500">({user.role})</span></p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              {/* Regra de UI: Não pode excluir a si mesmo nem outros admins */}
              {(user.id === currentUserId || user.role === 'admin') ? (
                <span className="text-sm text-gray-400 italic">Não pode ser excluído</span>
              ) : (
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                >
                  Excluir
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}