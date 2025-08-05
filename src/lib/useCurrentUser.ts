'use client'

import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
    user_id?: number
    exp?: number
  }
  
  export function useCurrentUser() {
    const [userId, setUserId] = useState<number | null>(null)
  
    useEffect(() => {
      const token = getCookie('token')
      if (!token) return
  
      try {
        const decoded: JwtPayload = jwtDecode(token)
        if (decoded.user_id) setUserId(decoded.user_id)
      } catch {}
    }, [])
  
    return { userId }
  }
  
  function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? match[2] : null
  }
