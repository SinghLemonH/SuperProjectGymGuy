import { apiFetch } from './fetchWithAuth'

export interface ExerciseLog {
  exercise_id: string
  actual_set: number
  actual_reps: number
  actual_duration: number 
}

export interface LogSessionPayload {
  user_id: string
  session_datetime: string 
  workout_plan_id?: string
  exercises: ExerciseLog[]
}

export interface ExerciseLogResponse {
  exercise_id: string
  name: string
  actual_set: number
  actual_reps: number
  actual_duration: number
  calories: number
}

export interface SessionDetailResponse {
  id: string
  session_number?: number
  session_datetime: string
  total_calories: number
  total_points?: number
  exercises: ExerciseLogResponse[]
  workout_plan?: { id: string; name: string }
}

export const getUserSessions = (userId: string) =>
  apiFetch(`/users/${userId}/workout-sessions`)

export const getSessionById = (id: string) =>
  apiFetch(`/workout-sessions/${id}`)

export const logSession = (payload: LogSessionPayload) =>
  apiFetch('/workout-sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateSession = (id: string, payload: Partial<LogSessionPayload>) =>
  apiFetch(`/workout-sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const deleteSession = (id: string) =>
  apiFetch(`/workout-sessions/${id}`, { method: 'DELETE' })