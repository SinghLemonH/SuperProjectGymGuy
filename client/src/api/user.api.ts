import { apiFetch } from './fetchWithAuth'

// ─── Interfaces ────────────────────────────────────────────────────

export interface UserDetailIn {
  id:           string
  username:     string
  email:        string
  sex:          string
  fitness_goal: string
  user_level:   string
  age:          number
  weight:       number
  height:       number
  bmr:          number
  member_since: string
}

// Dashboard ใช้
export interface UserProfileIn {
  bmr:            number
  user_level:     string
  total_calories: { total_calories: number }
  active_plan:    { id: string; plan_name: string; completeness: number } | null
  total_sessions: number
}

// Dashboard ใช้
export interface TotalScoresIn {
  data:       TotalScoreIn[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}

interface TotalScoreIn {
  workout_plan_code:  string
  workout_plan_name:  string
  user_id:            string
  exercise_code:      string
  exercise_name:      string
  exercise_category:  string
  total_score:        number
  full_count:         number
}

// Dashboard + Leaderboard ใช้
export interface LeaderboardsIn {
  data: LeaderboardIn[]
}

interface LeaderboardIn {
  user_id:     string
  username:    string
  user_level:  string
  calories:    number
  active_days: number
  consistency: number
  rank:        number
}

// Dashboard ใช้
export interface WorkoutSessionIn {
  id:               string
  session_no:       number
  user_id:          string
  workout_plan_id:  string | null
  session_datetime: string
}

// ─── API Functions ─────────────────────────────────────────────────

// GET /users/:id
export const getUserProfile = (id: string) =>
  apiFetch(`/users/${id}`)

export const userDetailDashboard = (id: string): Promise<UserDetailIn> =>
  apiFetch(`/users/${id}`)

// GET /users/:id/dashboard
export const getUserDashboard = (id: string) =>
  apiFetch(`/users/${id}/dashboard`)

export const userDashBoard = (id: string): Promise<UserProfileIn> =>
  apiFetch(`/users/${id}/dashboard`)

// GET /users/:id/leaderboard
export const getUserLeaderboard = (id: string) =>
  apiFetch(`/users/${id}/leaderboard`)

// GET /users/:id/workout-sessions
export const workoutSessionsDashboard = (userId: string): Promise<WorkoutSessionIn[]> =>
  apiFetch(`/users/${userId}/workout-sessions`)

// GET /reports/leaderboard-consistency-calories
export const leaderboardDashboard = (username?: string): Promise<LeaderboardsIn> => {
  const params = new URLSearchParams()
  if (username) params.append('username', username)
  const query = params.toString()
  return apiFetch(`/reports/leaderboard-consistency-calories${query ? '?' + query : ''}`)
}

// GET /reports/score-exercise-summary
export const totalScoreDashboard = (
  code?: string,
  start_date?: string,
  end_date?: string,
  page?: number,
  limit?: number,
  sortDir?: string
): Promise<TotalScoresIn> => {
  const params = new URLSearchParams()
  if (code)       params.append('code', code)
  if (start_date) params.append('start_date', start_date)
  if (end_date)   params.append('end_date', end_date)
  if (page)       params.append('page', String(page))
  if (limit)      params.append('limit', String(limit))
  if (sortDir)    params.append('sortDir', sortDir)
  const query = params.toString()
  return apiFetch(`/reports/score-exercise-summary${query ? '?' + query : ''}`)
}

// PATCH /users/:id
export const patchUserProfile = (id: string, body: Record<string, unknown>) =>
  apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

// DELETE /users/:id
export const deleteUser = (id: string) =>
  apiFetch(`/users/${id}`, { method: 'DELETE' })