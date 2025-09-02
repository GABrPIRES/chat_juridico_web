// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const upstream = await fetch(`${API}/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (upstream.ok) {
    return new NextResponse(null, { status: 204 })
  }

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}