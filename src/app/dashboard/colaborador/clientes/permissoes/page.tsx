'use client'
import { useEffect, useState } from 'react'
import { API_BASE } from '@/lib/api'

type User = { id:number; name:string; email:string; role:'admin'|'gerente'|'assistente' }

export default function PermissoesPage() {
  const [users, setUsers] = useState<User[]>([])
  useEffect(()=>{ 
    fetch(`${API_BASE}/users`, { cache:'no-store' }).then(r=>r.json()).then(setUsers)
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Permissões</h1>
      <div className="space-y-2">
        {users.map(u=>(
          <div key={u.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{u.name} <span className="text-xs text-gray-600">({u.role})</span></div>
              <div className="text-xs text-gray-600">{u.email}</div>
            </div>
            <div className="text-sm space-x-2">
              <button className="border px-2 py-1 rounded">Promover</button>
              <button className="border px-2 py-1 rounded">Rebaixar</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
