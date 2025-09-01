// src/lib/useCableChat.ts
'use client'
import { useEffect, useRef } from 'react'
import { getCable } from './cable'

export type IncomingMsg = {
  id: number
  chat_id: number
  content: string
  sender_type: 'client' | 'user' | 'ia'
  created_at: string
}

export function useCableChat(chatId: number | null, onReceive: (m: IncomingMsg) => void) {
  const subRef = useRef<any>(null)

  useEffect(() => {
    if (!chatId) return
    const cable = getCable() // ou getCable({ token }) caso precise
    if (!cable) return

    // Cria a subscription apenas quando chatId mudar
    const sub = cable.subscriptions.create(
      { channel: 'ChatChannel', chat_id: chatId },
      {
        received: (data: IncomingMsg) => onReceive(data),
      }
    )
    subRef.current = sub

    return () => {
      try { subRef.current?.unsubscribe() } catch {}
      subRef.current = null
    }
  }, [chatId, onReceive])
}
