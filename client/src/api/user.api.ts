// api/user.api.ts
import { apiFetch } from './fetchWithAuth'

// --- Interfaces ---

interface ActivePlan {
    id: string
    plan_name: string
    completeness: number
}

export interface UserProfileIn {
    bmr: number
    user_level: string
    total_calories: { total_calories: number }
    active_plan: ActivePlan | null
    total_sessions: number
}


export interface UserDetailIn {
    id : string 
    username : string
    email : string
    sex : string
    fitness_goal : string 
    user_level : string
    age : number
    weight : number
    height : number
    bmr : number
    member_since : string
}
interface TotalScoreIn {
    workout_plan_code: string
    workout_plan_name: string
    user_id: string
    exercise_code: string
    exercise_name: string
    exercise_category: string
    total_score: number
    full_count: number
}
export interface TotalScoresIn {
    data: TotalScoreIn[]
    page: number
    limit: number
    total: number
    totalPages: number
}

interface LeaderboardIn {
    user_id : string
    username: string
    user_level: string
    calories: number
    active_days: number
    consistency: number
    rank: number
}

export interface LeaderboardsIn {
    data: LeaderboardIn[]
}

export interface WorkoutSessionIn {
    id: string
    session_no: number
    user_id: string
    workout_plan_id: string | null
    session_datetime: string
}


// --- API Functions ---
// User dashboard
export const userDashBoard = (userId: string): Promise<UserProfileIn> =>
    apiFetch(`/users/${userId}/dashboard`)

export const userDetailDashboard = (userId: string): Promise<UserDetailIn> => 
    apiFetch(`/users/${userId}`)
  // for leaderboard score
  export const totalScoreDashboard = (
      userId: string,
      code?: string,
      start_date?: string,
      end_date?: string,
      page?: number,
      limit?: number,
      sortDir?: string
  ): Promise<TotalScoresIn> => {
      const params = new URLSearchParams()
      params.append('user_id', userId)
      if (code)       params.append('code', code)
      if (start_date) params.append('start_date', start_date)
      if (end_date)   params.append('end_date', end_date)
      if (page)       params.append('page', String(page))
      if (limit)      params.append('limit', String(limit))
      if (sortDir)    params.append('sortDir', sortDir)
      const query = params.toString()

  return apiFetch(`/reports/score-exercise-summary${query ? '?' + query : ''}`)
  }

// for leaderboard calories
export const leaderboardDashboard = (username?: string): Promise<LeaderboardsIn> => {
    const params = new URLSearchParams()
    if (username) params.append('username', username)
    const query = params.toString()
    return apiFetch(`/reports/leaderboard-consistency-calories${query ? '?' + query : ''}`)
}

// for workout session 
export const workoutSessionsDashboard = (userId: string): Promise<WorkoutSessionIn[]> =>
    apiFetch(`/users/${userId}/workout-sessions`)