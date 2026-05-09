export interface User {
  id: string
  username: string
  email: string
  bmr: number
  fitness_goal: string
  member_since: string
}

export const getToken    = () => localStorage.getItem('access_token')
export const getUser     = (): User | null => {
  const raw = localStorage.getItem('user')
  return raw ? (JSON.parse(raw) as User) : null
}
export const isLoggedIn  = () => !!getToken()
export const saveSession = (access: string, refresh: string, user: User) => {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
  localStorage.setItem('user', JSON.stringify(user))
}
export const clearSession = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}
