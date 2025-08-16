// src/app/api/user/clients/client/[clientId]/chats/[chatId]/messages/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// GET /api/user/clients/client/:clientId/chats/:chatId/messages
export async function GET(
  _req: Request,
  { params }: { params: { id: string; chatId: string } }
) {
    console.log("ClienteID:", params.id," e ChatId: ",params.chatId)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rails: GET /api/user/clients/:clientId/chats/:chatId/messages
  const upstream = await fetch(`${API}/user/clients/${params.id}/chats/${params.chatId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}

// POST /api/user/clients/client/:clientId/chats/:chatId/messages
export async function POST(
  req: Request,
  { params }: { params: { id: string; chatId: string } }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() // { content, sender_type }
  const upstream = await fetch(`${API}/user/clients/${params.id}/chats/${params.chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    // Rails espera { message: { content, sender_type } }
    body: JSON.stringify({ message: body }),
  })

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}
