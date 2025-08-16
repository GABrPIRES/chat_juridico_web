export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function apiGet(path: string, init: RequestInit = {}) {
  return fetch(`${API_BASE}${path}`, { ...init, cache: 'no-store' })
}

export async function apiPost(path: string, body?: unknown, init: RequestInit = {}) {
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    body: JSON.stringify(body ?? {}),
  })
}
