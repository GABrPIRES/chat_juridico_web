// src/app/api/decision-tree/questions/[id]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// O segundo argumento é o 'context' (ctx)
export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  // A correção é aguardar (await) os parâmetros aqui
  const { id } = ctx.params;
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Agora usamos o 'id' que foi aguardado
  const upstream = await fetch(`${API}/decision_tree/questions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!upstream.ok) {
    const error = await upstream.json()
    return NextResponse.json(error, { status: upstream.status })
  }

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}