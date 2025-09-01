// src/lib/cable.ts
'use client'
import * as ActionCable from '@rails/actioncable'

let consumer: ReturnType<typeof ActionCable.createConsumer> | null = null

export function getCable(options?: { token?: string }) {
  if (typeof window === 'undefined') return null
  if (consumer) return consumer

  let url = process.env.NEXT_PUBLIC_CABLE_URL!
  // Se precisar passar token por query (quando cookie não chega ao /cable)
  if (options?.token) {
    const sep = url.includes('?') ? '&' : '?'
    url = `${url}${sep}token=${encodeURIComponent(options.token)}`
  }

  consumer = ActionCable.createConsumer(url)
  return consumer
}
