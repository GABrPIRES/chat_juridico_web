'use client'
import { useEffect, useState } from 'react'

// Definimos um tipo para o usuário, incluindo o cargo
type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'gerente' | 'assistente';
}

export default function ColaboradorHome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar os dados do usuário logado
    async function fetchCurrentUser() {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) throw new Error('Falha ao carregar dados do usuário');
        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

  if (loading) {
    return <main className="p-6">Carregando...</main>;
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Home do Colaborador</h1>
      <p className="text-sm text-gray-600 mb-4">Bem-vindo, {user?.name}!</p>
      
      <ul className="mt-3 list-disc pl-6 text-sm space-y-2">
        {/* Link visível para todos os colaboradores */}
        <li><a href="/dashboard/colaborador/clientes" className="text-blue-600 hover:underline">Gerenciar Clientes</a></li>

        {/* Links visíveis apenas para Admin e Gerente */}
        {(user?.role === 'admin' || user?.role === 'gerente') && (
          <li><a href="/dashboard/colaborador/atribuicoes" className="text-blue-600 hover:underline">Atribuir Clientes</a></li>
        )}

        {/* Links visíveis apenas para Admin */}
        {user?.role === 'admin' && (
          <>
            <li><a href="/dashboard/colaborador/usuarios" className="text-blue-600 hover:underline">Gerenciar Usuários</a></li>
            <li><a href="/dashboard/colaborador/permissoes" className="text-blue-600 hover:underline">Gerenciar Permissões</a></li>
          </>
        )}
      </ul>
    </main>
  )
}