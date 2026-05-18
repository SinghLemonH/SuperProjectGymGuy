import { saveSession, clearSession, getToken } from './auth'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

async function handleRes(res: Response) {
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiRegister(payload: {
  username: string
  email: string
  password: string
  fitness_goal: string
  sex: string
  age: number
  weight: number
  height: number
}) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await handleRes(res)
  saveSession(data.access_token, data.refresh_token, data.user)
  return data
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await handleRes(res)
  saveSession(data.access_token, data.refresh_token, data.user)
  return data
}

export async function apiLogout() {
  const token = getToken()
  if (token) {
    try {
      await fetch(`${BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch { /* ignore */ }
  }
  clearSession()
}