'use client'
import { useEffect, useState, FormEvent } from 'react'

// Adicionamos o 'status' ao tipo Client
type Client = { id: number; name?: string | null; email?: string | null; status: 'active' | 'inactive' }

export default function GerenciarClientesPage() {
  // State da lista de clientes
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State do formulário de criação
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Função para buscar clientes
  async function fetchClients() {
    setLoading(true)
    try {
      const res = await fetch('/api/user/clients', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao carregar clientes')
      const data = await res.json()
      setClients(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // Função para criar novo cliente
  async function handleCreateClient(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/client/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { name, email, phone, password, password_confirmation: password },
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.errors?.join(', ') || 'Erro desconhecido')
      }
      alert('Cliente criado com sucesso!')
      setName(''); setEmail(''); setPhone(''); setPassword('');
      fetchClients(); // Recarrega a lista
    } catch (e: any) {
      alert(`Erro ao criar cliente: ${e.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Função para alterar o status do cliente
  async function handleStatusChange(clientId: number, newStatus: 'active' | 'inactive') {
    try {
      const res = await fetch(`/api/clients/${clientId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: { status: newStatus } }),
      })
      if (!res.ok) throw new Error('Falha ao atualizar status')
      
      const updatedClient = await res.json();
      // Atualiza a lista localmente
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c))
    } catch (e: any) {
      alert(`Erro: ${e.message}`)
    }
  }

  return (
    <main className="p-6 space-y-8">
      <section>
        <h1 className="text-xl font-bold mb-4">Criar Novo Cliente</h1>
        <form onSubmit={handleCreateClient} className="max-w-lg space-y-3 bg-white p-4 rounded-lg border">
          <input className="border px-3 py-2 rounded w-full" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />
          <input type="email" className="border px-3 py-2 rounded w-full" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="border px-3 py-2 rounded w-full" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} required />
          <input type="password" className="border px-3 py-2 rounded w-full" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Cliente'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Clientes Cadastrados</h2>
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-600">Erro: {error}</p>}
        <div className="space-y-3">
          {clients.map(c => (
            <div key={c.id} className="border rounded-lg p-4 flex items-center justify-between shadow-sm bg-white">
              <div>
                <p className="font-bold">{c.name ?? `Cliente #${c.id}`}
                  <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </p>
                {c.email && <p className="text-sm text-gray-600">{c.email}</p>}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleStatusChange(c.id, c.status === 'active' ? 'inactive' : 'active')}
                  className={`text-sm px-3 py-1 rounded ${c.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  {c.status === 'active' ? 'Desativar' : 'Ativar'}
                </button>
                <a className="underline text-sm" href={`/dashboard/colaborador/clientes/${c.id}`}>
                  Ver cliente
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}