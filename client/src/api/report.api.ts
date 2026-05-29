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
    category?: string,
    difficulty_level?: string,
    exercise_name?: string
): Promise<WichitReportsIn> => {
    const params = new URLSearchParams()

    if (category)         params.append('category', category)
    if (difficulty_level) params.append('difficulty_level', String(difficulty_level))
    if (exercise_name)    params.append('exercise_name', exercise_name)

    const query = params.toString()
    return apiFetch(`/reports/exercise-popularity${query ? '?' + query : ''}`)
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
    const query = params.toString()
    return apiFetch(`/reports/user-weight-bmi-progress${query ? '?' + query : ''}`)
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
    const query = params.toString()
    return apiFetch(`/reports/leaderboard-consistency-calories${query ? '?' + query : ''}`)
}

// ------ wathit report -----
export const userBMR = (): Promise<WathitReportsIn> =>
    apiFetch(`/reports/user-bmr`)
export const exerciseCaloriesBurned = (): Promise<WathitReportsIn> =>
    apiFetch(`/reports/exercise-calories-burned`)
export const totalEnergyBurned = (): Promise<WathitReportsIn> =>
    apiFetch(`/reports/total-energy-burned`)

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
    return apiFetch(`/reports/score-exercise-summary${query ? '?' + query : ''}`)
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
    return apiFetch(`/reports/exercise-muscle-plan-list${query ? '?' + query : ''}`)
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
    return apiFetch(`/reports/workout-distribution${query ? '?' + query : ''}`)
}

// ------ apich (may) report -----
// (no query params — simple aggregate reports)
export const totalCaloriesBurned = (): Promise<MayReportsIn> =>
    apiFetch(`/reports/total-calories-burned`)

export const totalWorkoutSessions = (): Promise<MayReportsIn> =>
    apiFetch(`/reports/total-workout-sessions`)

export const planAchievement = (): Promise<MayReportsIn> =>
    apiFetch(`/reports/plan-achievement`)

