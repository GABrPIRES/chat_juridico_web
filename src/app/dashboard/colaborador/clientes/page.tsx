'use client'
import { useEffect, useState } from 'react'

type Client = { id: number; name?: string | null; email?: string | null }

export default function ClientesPage() {
  const [data, setData] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user/clients', { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then(setData)
      .catch(e => setError(`Falha ao carregar (${e.message})`))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Carregando...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Clientes</h1>
      {data.length === 0 && <div className="text-sm text-gray-600">Nenhum cliente.</div>}

      <div className="space-y-2">
        {data.map(c => (
          <div key={c.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name ?? `Cliente #${c.id}`}</div>
              {c.email && <div className="text-xs text-gray-600">{c.email}</div>}
            </div>
            <a className="underline text-sm" href={`/dashboard/colaborador/clientes/${c.id}`}>
              Ver cliente
            </a>
          </div>
        ))}
      </div>
    </main>
  )
}
