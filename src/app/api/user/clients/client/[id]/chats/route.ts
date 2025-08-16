import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rails: GET /api/user/clients/:client_id/chats  (sem "/client" no meio)
  const upstream = await fetch(`${API}/user/clients/${params.id}/chats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}
