// src/app/api/client/signup/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export async function POST(req: Request) {
  // A criação de clientes precisa ser autenticada por um usuário (admin/gerente)
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const upstream = await fetch(`${API}/client/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}