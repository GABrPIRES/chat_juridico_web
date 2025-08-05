'use client'

import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  client_id?: number
  exp?: number
}

export function useCurrentClient() {
  const [clientId, setClientId] = useState<number | null>(null)

  useEffect(() => {
    const token = getCookie('token')
    if (!token) return

    try {
      const decoded: JwtPayload = jwtDecode(token)
      if (decoded.client_id) setClientId(decoded.client_id)
    } catch {}
  }, [])

  return { clientId }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}
