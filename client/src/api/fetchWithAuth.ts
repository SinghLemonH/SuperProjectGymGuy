import { getToken, clearSession } from './auth'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

async function tryRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) return null
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) return null
    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    return data.access_token as string
  } catch { return null }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = getToken()

  const makeReq = (t: string | null) => fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...options.headers,
    },
  })

  let res = await makeReq(token)

  if (res.status === 401) {
    token = await tryRefresh()
    if (!token) { clearSession(); window.location.href = '/login'; throw new Error('Session expired') }
    res = await makeReq(token)
  }

  const data = await res.json()
  if (!res.ok) throw data
  return data as T
}
