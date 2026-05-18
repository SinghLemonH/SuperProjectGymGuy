import { apiFetch } from './fetchWithAuth'

// GET /users/:id
export const getUserProfile = (id: string) =>
  apiFetch(`/users/${id}`)

// GET /users/:id/dashboard
export const getUserDashboard = (id: string) =>
  apiFetch(`/users/${id}/dashboard`)

// GET /users/:id/leaderboard
export const getUserLeaderboard = (id: string) =>
  apiFetch(`/users/${id}/leaderboard`)

// PATCH /users/:id
export const patchUserProfile = (id: string, body: Record<string, unknown>) =>
  apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

// DELETE /users/:id
export const deleteUser = (id: string) =>
  apiFetch(`/users/${id}`, { method: 'DELETE' })