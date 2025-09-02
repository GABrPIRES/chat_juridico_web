// src/app/api/client/chat/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export async function GET() {
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const upstream = await fetch(`${API}/client/chat`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  const text = await upstream.text()
  return new NextResponse(text || '[]', {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: Request) {
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { content: string }
  const upstream = await fetch(`${API}/client/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: { content: body.content } }),
  })

  const text = await upstream.text()
  return new NextResponse(text || '{}', {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
