// src/app/api/decision-tree/questions/[id]/options/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// Corrigido para usar { params: { id: string } }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Corrigido para usar params.id
  const upstream = await fetch(`${API}/decision_tree/questions/${params.id}/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  
  const text = await upstream.text() // Lemos como texto para evitar erro de JSON vazio
  try {
    const data = JSON.parse(text)
    return NextResponse.json(data, { status: upstream.status });
  } catch (e) {
    return new NextResponse(text, { status: upstream.status })
  }
}