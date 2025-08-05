import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  console.log(token)
  const { pathname } = req.nextUrl

  const isAuthRoute = pathname.startsWith('/login')
  const isDashboard = pathname.startsWith('/dashboard')

  console.log(isAuthRoute)
  console.log(isDashboard)

  // Sem token e tentando acessar dashboard? Redireciona para login
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Se tem token, extrai o payload
  const payload = token ? parseJwt(token) : null
  console.log(payload)
  const isClient = !!payload?.client_id
  const isUser = !!payload?.user_id

  console.log(isClient)
  console.log(isUser)

  // Se autenticado tentar acessar /login → redireciona conforme o tipo
  if (isAuthRoute && token) {
    const redirectTo = isClient
      ? '/dashboard/cliente'
      : '/dashboard/colaborador'

    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  // Protege rota do cliente: só cliente entra
  if (pathname.startsWith('/dashboard/cliente') && !isClient) {
    return NextResponse.redirect(new URL('/dashboard/colaborador', req.url))
  }

  // Protege rota do colaborador: só user entra
  if (pathname.startsWith('/dashboard/colaborador') && !isUser) {
    return NextResponse.redirect(new URL('/dashboard/cliente', req.url))
  }

  return NextResponse.next()
}

function parseJwt(token: string): any {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  } catch {
    return null
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login/:path*'],
}
