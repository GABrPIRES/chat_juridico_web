'use client'
import { useEffect, useState } from 'react'

// Tipos de dados que vamos usar na página
type User = { id: number; name: string; role: string }
type Client = { id: number; name: string }
type Assignment = { id: number; user_id: number; client_id: number }

export default function AtribuicoesPage() {
  // Estados para armazenar os dados da API
  const [clients, setClients] = useState<Client[]>([])
  const [assistants, setAssistants] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar todos os dados necessários da API
  async function fetchData() {
    try {
      // Usamos Promise.all para fazer as chamadas em paralelo, o que é mais rápido
      const [clientsRes, usersRes, assignmentsRes] = await Promise.all([
        fetch('/api/user/clients'),
        fetch('/api/users'),
        fetch('/api/user/client_assignments')
      ]);

      if (!clientsRes.ok || !usersRes.ok || !assignmentsRes.ok) {
        throw new Error('Falha ao carregar dados do servidor');
      }

      const clientsData = await clientsRes.json();
      const usersData: User[] = await usersRes.json();
      const assignmentsData = await assignmentsRes.json();
      
      // Filtramos para pegar apenas os assistentes
      const assistantUsers = usersData.filter(u => u.role === 'assistente');

      setClients(clientsData);
      setAssistants(assistantUsers);
      
      // Extraímos apenas os IDs para facilitar a verificação
      setAssignments(assignmentsData.map((a: any) => ({
        id: a.id,
        user_id: a.user.id,
        client_id: a.client.id
      })));

    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Função chamada quando um checkbox é marcado/desmarcado
  async function handleAssignmentChange(clientId: number, assistantId: number, isChecked: boolean) {
    if (isChecked) {
      // CRIAR uma nova atribuição
      try {
        const res = await fetch('/api/user/client_assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_assignment: { user_id: assistantId, client_id: clientId }
          })
        });
        if (!res.ok) throw new Error('Falha ao criar atribuição');
        // Recarrega os dados para garantir consistência
        fetchData();
      } catch (e: any) {
        alert(`Erro: ${e.message}`);
      }
    } else {
      // DELETAR uma atribuição existente
      // Primeiro, encontramos o ID da atribuição a ser deletada
      const assignmentToDelete = assignments.find(
        a => a.client_id === clientId && a.user_id === assistantId
      );
      if (!assignmentToDelete) return;

      try {
        const res = await fetch(`/api/user/client_assignments/${assignmentToDelete.id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Falha ao remover atribuição');
        // Recarrega os dados para garantir consistência
        fetchData();
      } catch (e: any) {
        alert(`Erro: ${e.message}`);
      }
    }
  }

  if (loading) return <main className="p-6">Carregando...</main>
  if (error) return <main className="p-6 text-red-500">{error}</main>

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Atribuir Clientes a Assistentes</h1>
      <div className="space-y-6">
        {clients.map(client => (
          <div key={client.id} className="bg-white p-4 rounded-lg border shadow-sm">
            <h2 className="font-bold text-lg mb-3">{client.name}</h2>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Assistentes atribuídos:</h3>
              {assistants.length > 0 ? assistants.map(assistant => {
                const isAssigned = assignments.some(
                  a => a.client_id === client.id && a.user_id === assistant.id
                );
                return (
                  <div key={assistant.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`client-${client.id}-asst-${assistant.id}`}
                      checked={isAssigned}
                      onChange={(e) => handleAssignmentChange(client.id, assistant.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`client-${client.id}-asst-${assistant.id}`} className="ml-2 block text-sm text-gray-900">
                      {assistant.name}
                    </label>
                  </div>
                )
              }) : <p className="text-sm text-gray-500">Nenhum assistente cadastrado.</p>}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}