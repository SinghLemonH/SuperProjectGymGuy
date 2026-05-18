// report.api
import { apiFetch } from "./fetchWithAuth";

// ------ interface ---------
export interface WichitReportsIn {
    data: any[];
}

export interface KittiReportsIn {
    data: any[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface WathitReportsIn {
    data: any[];
}

export interface MayReportsIn {
    data: any[];
}

// ------ Function ----------
// ------ wichitchai report -----
export const exerPopularity = (
    category?: string,           // ← ? means optional
    difficulty_level?: string,
    exercise_name?: string
): Promise<WichitReportsIn> => {
    const params = new URLSearchParams()

    if (category)         params.append('category', category)
    if (difficulty_level) params.append('difficulty_level', String(difficulty_level))
    if (exercise_name)    params.append('exercise_name', exercise_name)

    const query = params.toString()  // empty string if nothing was added
    return apiFetch(`/WichitReports/exercise-popularity${query ? '?' + query : ''}`)
}

export const userWeightBMI = (
    username?: string, 
    from_date?: string, 
    to_date?: string
): Promise<WichitReportsIn> => {
    const params = new URLSearchParams()

    if (username)         params.append('username', username)
    if (from_date) params.append('from_date', from_date)
    if (to_date)    params.append('to_date', to_date)

    const query = params.toString()  // empty string if nothing was added
    return apiFetch(`/WichitReports/user-weight-bmi-progress${query ? '?' + query : ''}`)
}

export const leaderboardConsisCal = (
    username?: string,
    month?: string,
    sort_by?: string,
    order?: string
): Promise<WichitReportsIn> => {
    const params = new URLSearchParams()

    if (username)         params.append('username', username)
    if (month) params.append('month', month)
    if (sort_by)    params.append('sort_by', sort_by)
    if (order)    params.append('order', order)

    const query = params.toString()  // empty string if nothing was added
    return apiFetch(`/WichitReports/leaderboard-consistency-calories${query ? '?' + query : ''}`)
}

// ------ wathit report -----

export const userBMR = (): Promise<WathitReportsIn> =>
    apiFetch(`/WathitReports/user-bmr`)

export const exerciseCaloriesBurned = (): Promise<WathitReportsIn> =>
    apiFetch(`/WathitReports/exercise-calories-burned`)

export const totalEnergyBurned = (): Promise<WathitReportsIn> =>
    apiFetch(`/WathitReports/total-energy-burned`)

// ------ kitti (Est) report -----

export const scoreExerciseSummary = (
    user_id : string,
    workout_plan_code?: string,
    start_date?: string,
    end_date?: string,
    page? : number,
    limit? : number,
    sortDir? : string
): Promise<KittiReportsIn> => {
    const params = new URLSearchParams()
    params.append('user_id', user_id)
    if (workout_plan_code)       params.append('code', workout_plan_code)
    if (start_date) params.append('start_date', start_date)
    if (end_date)   params.append('end_date', end_date)
    if (page !== undefined) params.append('page', String(page))
    if (limit !== undefined)      params.append('limit', String(limit))
    if (sortDir !== undefined)    params.append('sortDir', sortDir)

    const query = params.toString()
    return apiFetch(`/KittiReports/score-exercise-summary${query ? '?' + query : ''}`)
}

export const exerciseMusclePlanList = (
    user_id : string,
    muscle_area? : string,
    page? : number,
    limit? : number,
    sortDir? : string
): Promise<KittiReportsIn> => {
    const params = new URLSearchParams()
    params.append('user_id', user_id)
    if (muscle_area) params.append('muscle_area', muscle_area)
    if (page !== undefined)        params.append('page', String(page))
    if (limit !== undefined)       params.append('limit', String(limit))
    if (sortDir !== undefined)     params.append('sortDir', sortDir)

    const query = params.toString()
    return apiFetch(`/KittiReports/exercise-muscle-plan-list${query ? '?' + query : ''}`)
}

export const workoutDistribution = (
    user_id : string,
    page? : number,
    limit? : number,
    sortDir? : string
): Promise<KittiReportsIn> => {
    const params = new URLSearchParams()
    params.append('user_id', user_id)
    if (page !== undefined)    params.append('page', String(page))
    if (limit !== undefined)   params.append('limit', String(limit))
    if (sortDir !== undefined) params.append('sortDir', sortDir)

    const query = params.toString()
    return apiFetch(`/KittiReports/workout-distribution${query ? '?' + query : ''}`)
}

// ------ apich (may) report -----
// (no query params — simple aggregate reports)
export const totalCaloriesBurned = (): Promise<MayReportsIn> =>
    apiFetch(`/ApichReports/reports/total-calories-burned`)

export const totalWorkoutSessions = (): Promise<MayReportsIn> =>
    apiFetch(`/ApichReports/reports/total-workout-sessions`)

export const planAchievement = (): Promise<MayReportsIn> =>
    apiFetch(`/ApichReports/reports/plan-achievement`)



