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

    let isSubscribed = true

    // Função assíncrona para buscar o token e conectar
    const connectToCable = async () => {
      try {
        // 1. Busca o token da nossa API de frontend
        const tokenResponse = await fetch('/api/ws-token')
        if (!tokenResponse.ok) {
          throw new Error('Falha ao obter token para WebSocket')
        }
        const { token } = await tokenResponse.json()

        // 2. Passa o token para a função que cria a conexão
        const cable = getCable({ token })
        if (!cable || !isSubscribed) return

        // 3. Cria a inscrição no canal com o token
        const sub = cable.subscriptions.create(
          { channel: 'ChatChannel', chat_id: chatId },
          {
            received: (data: IncomingMsg) => onReceive(data),
          }
        )
        subRef.current = sub
      } catch (error) {
        console.error('Erro ao conectar ao Action Cable:', error)
      }
    }

    connectToCable()

    return () => {
      isSubscribed = false
      try {
        subRef.current?.unsubscribe()
      } catch {}
      subRef.current = null
    }
  }, [chatId, onReceive])
}