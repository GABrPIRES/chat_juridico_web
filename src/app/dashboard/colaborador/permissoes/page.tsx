'use client'
import { useEffect, useState } from 'react'
import { useCurrentUser } from '@/lib/useCurrentUser' // Importaremos o hook para saber quem está logado

type User = { id: number; name: string; email: string; role: 'admin' | 'gerente' | 'assistente' }

export default function PermissoesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userId: currentUserId } = useCurrentUser() // Pega o ID do usuário logado

  // Função para buscar os usuários
  async function fetchUsers() {
    try {
      // CORREÇÃO: Busca diretamente da nova rota de usuários
      const res = await fetch('/api/users')
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Falha ao carregar usuários')
      }
      const usersList = await res.json()
      setUsers(usersList)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Função para alterar o cargo de um usuário
  async function handleRoleChange(userId: number, newRole: string) {
    if (!newRole) return

    try {
      const res = await fetch(`/api/user/roles/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { role: newRole } }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Falha ao atualizar cargo')
      }

      const updatedUser = await res.json()

      // Atualiza a lista de usuários localmente para refletir a mudança
      setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)))
      alert('Cargo atualizado com sucesso!')
    } catch (e: any) {
      alert(`Erro: ${e.message}`)
    }
  }

  if (loading) return <main className="p-6">Carregando usuários...</main>
  if (error) return <main className="p-6 text-red-600">Erro: {error}</main>

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Gerenciar Permissões de Usuários</h1>
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="border rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">Cargo atual: <span className="font-semibold">{user.role}</span></p>
            </div>
            
            {/* Regras de UI:
              - Não pode alterar o próprio cargo
              - Não pode alterar o cargo de outro admin
            */}
            {(user.id === currentUserId || user.role === 'admin') ? (
              <p className="text-sm text-gray-400">Não pode ser alterado</p>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  defaultValue={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="assistente">Assistente</option>
                  <option value="gerente">Gerente</option>
                  {/* Apenas admins podem ver a opção de promover para admin */}
                  {/* Descomente a linha abaixo se quiser que admins possam promover outros para admin */}
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}