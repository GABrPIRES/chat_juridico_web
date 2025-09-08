// src/app/api/decision-tree/questions/[id]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const upstream = await fetch(`${API}/decision_tree/questions/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  // Adicionamos tratamento de erro para mais clareza
  if (!upstream.ok) {
    const error = await upstream.json()
    return NextResponse.json(error, { status: upstream.status })
  }

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}