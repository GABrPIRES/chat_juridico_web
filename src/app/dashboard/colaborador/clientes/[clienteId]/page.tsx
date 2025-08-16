'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Client = { id: number; name?: string | null; email?: string | null }

export default function ClienteDetalhePage() {
  const { clienteId } = useParams<{ clienteId: string }>()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clienteId) return
    fetch(`/api/user/clients/client/${clienteId}`, { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then(setClient)
      .catch(e => setError(`Falha ao carregar cliente (${e.message})`))
      .finally(() => setLoading(false))
  }, [clienteId])

  if (loading) return <div className="p-6">Carregando...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!client) return <div className="p-6">Cliente não encontrado.</div>

  return (
    <main className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold">{client.name ?? `Cliente #${client.id}`}</h1>
        {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
      </div>

      <div className="space-x-2">
        <a className="underline text-sm" href={`/dashboard/colaborador/clientes/${client.id}/chat/cliente`}>Chat Cliente</a>
        <a className="underline text-sm" href={`/dashboard/colaborador/clientes/${client.id}/chat/ia`}>Chat IA</a>
      </div>
    </main>
  )
}
