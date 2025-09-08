'use client'
import { useEffect, useState } from 'react'

// Adicionamos a nova permissão ao tipo Assignment
type User = { id: number; name: string; role: string }
type Client = { id: number; name: string }
type Assignment = { id: number; user_id: number; client_id: number; can_reply_to_client: boolean }

export default function AtribuicoesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [assistants, setAssistants] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar todos os dados necessários da API
  async function fetchData() {
    try {
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
      
      const assistantUsers = usersData.filter(u => u.role === 'assistente');

      setClients(clientsData);
      setAssistants(assistantUsers);
      
      // Agora extraímos também a nova permissão
      setAssignments(assignmentsData.map((a: any) => ({
        id: a.id,
        user_id: a.user.id,
        client_id: a.client.id,
        can_reply_to_client: a.can_reply_to_client
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

  // Função para criar ou remover uma atribuição
  async function handleAssignmentChange(clientId: number, assistantId: number, isChecked: boolean) {
    if (isChecked) {
      // ... (código para CRIAR atribuição continua o mesmo)
      try {
        const res = await fetch('/api/user/client_assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_assignment: { user_id: assistantId, client_id: clientId }
          })
        });
        if (!res.ok) throw new Error('Falha ao criar atribuição');
        fetchData();
      } catch (e: any) {
        alert(`Erro: ${e.message}`);
      }
    } else {
      // ... (código para DELETAR atribuição continua o mesmo)
      const assignmentToDelete = assignments.find(
        a => a.client_id === clientId && a.user_id === assistantId
      );
      if (!assignmentToDelete) return;
      try {
        const res = await fetch(`/api/user/client_assignments/${assignmentToDelete.id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Falha ao remover atribuição');
        fetchData();
      } catch (e: any) {
        alert(`Erro: ${e.message}`);
      }
    }
  }
  
  // NOVA FUNÇÃO para ligar/desligar a permissão de resposta
  async function handleToggleReplyPermission(assignmentId: number) {
    try {
      const res = await fetch(`/api/user/client_assignments/${assignmentId}/toggle_reply`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Falha ao atualizar permissão');
      
      const updatedAssignment = await res.json();
      
      // Atualiza o estado local para refletir a mudança instantaneamente
      setAssignments(prev => prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));

    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    }
  }

  if (loading) return <main className="p-6">Carregando...</main>
  if (error) return <main className="p-6 text-red-500">{error}</main>

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Atribuir Clientes e Permissões</h1>
      <div className="space-y-6">
        {clients.map(client => (
          <div key={client.id} className="bg-white p-4 rounded-lg border shadow-sm">
            <h2 className="font-bold text-lg mb-3">{client.name}</h2>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Assistentes:</h3>
              {assistants.length > 0 ? assistants.map(assistant => {
                const assignment = assignments.find(
                  a => a.client_id === client.id && a.user_id === assistant.id
                );
                const isAssigned = !!assignment;

                return (
                  <div key={assistant.id} className="flex items-center justify-between">
                    {/* Checkbox de Atribuição */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`assign-${client.id}-${assistant.id}`}
                        checked={isAssigned}
                        onChange={(e) => handleAssignmentChange(client.id, assistant.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`assign-${client.id}-${assistant.id}`} className="ml-2 block text-sm text-gray-900">
                        {assistant.name}
                      </label>
                    </div>

                    {/* NOVO CHECKBOX de Permissão (só aparece se o assistente estiver atribuído) */}
                    {isAssigned && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`reply-${client.id}-${assistant.id}`}
                          checked={assignment.can_reply_to_client}
                          onChange={() => handleToggleReplyPermission(assignment.id)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor={`reply-${client.id}-${assistant.id}`} className="ml-2 block text-sm text-gray-700">
                          Pode responder ao cliente
                        </label>
                      </div>
                    )}
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