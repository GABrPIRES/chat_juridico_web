'use client'
import { useState } from 'react'
import { API_BASE } from '@/lib/api'

export default function CriarPage() {
  const [role, setRole] = useState<'cliente'|'assistente'|'gerente'>('cliente')
  const [name, setName] = useState(''); const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault()
    const path = role==='cliente' ? '/client/signup' : '/user/signup'
    const body = role==='cliente' 
      ? { name, email, password, password_confirmation: password }
      : { user: { name, email, role, password, password_confirmation: password } }

    const r = await fetch(`${API_BASE}${path}`, {
      method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body)
    })
    alert(r.ok ? 'Criado!' : 'Erro ao criar')
  }

  return (
    <main className="p-6 max-w-lg">
      <h1 className="text-xl font-bold mb-4">Criar usuário/cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select className="border px-3 py-2 rounded w-full" value={role} onChange={e=>setRole(e.target.value as any)}>
          <option value="cliente">Cliente</option>
          <option value="assistente">Assistente</option>
          <option value="gerente">Gerente</option>
        </select>
        <input className="border px-3 py-2 rounded w-full" placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border px-3 py-2 rounded w-full" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="border px-3 py-2 rounded w-full" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="border px-3 py-2 rounded">Criar</button>
      </form>
    </main>
  )
}
