// src/app/api/user/client_assignments/[id]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// Função para DELETAR uma atribuição
export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const { id } = ctx.params
  const token = (await cookies()).get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const upstream = await fetch(`${API}/user/client_assignments/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // Se a API Rails retornou sucesso (204 No Content), repassamos isso
  if (upstream.ok) {
    return new NextResponse(null, { status: 204 })
  }

  // Se deu erro, repassamos o erro
  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}