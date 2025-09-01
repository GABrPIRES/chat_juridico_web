// src/app/api/user/clients/client/[id]/chats/route.ts
import { cookies } from 'next/headers'
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const token = (await cookies()).get('token')?.value
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const upstream = await fetch(`${API}/user/clients/${id}/chats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' }
  })
}
