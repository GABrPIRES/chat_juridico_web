// src/app/api/login/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const res = await fetch('http://localhost:3001/client/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const data = await res.json()

  // Exemplo de resposta esperada da API Rails:
  // {
  //   token: 'jwt_token_aqui',
  //   user: {
  //     id: 1,
  //     email: '...',
  //     role: 'cliente' // ou 'admin', 'assistente', etc.
  //   }
  // }
  const response = NextResponse.json({ role: data.client })
  response.cookies.set('token', data.token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return response
}
