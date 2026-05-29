// pages/Dashboard.tsx
import { useEffect, useState } from 'react'
import { getUser } from '../api/auth'
import { userDashBoard, totalScoreDashboard, leaderboardDashboard, workoutSessionsDashboard } from '../api/user.api'
import BannerSlider from '../components/ui/BannerSlider'
import StatsCard from '../components/ui/StatsCard'
import type {UserProfileIn, TotalScoresIn, LeaderboardsIn, WorkoutSessionIn} from '../api/user.api'


export default function Dashboard() {
    // Get user local token
    const user = getUser()

    // Set useState for each function result
    const [profile, setProfile]   = useState<UserProfileIn | null>(null)
    const [scoreTotal, setTotalScore] = useState<TotalScoresIn | null>(null)
    const [scoreCal, setCalScore] = useState<LeaderboardsIn | null>(null)
    const [workoutSession, setWorkoutSession] = useState<WorkoutSessionIn[] | null>(null)
    const [loading, setLoading]   = useState(true)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        const load = async () => {
            try {
                const [profileData, calData, sessionData] = await Promise.all([
                    userDashBoard(user.id),
                    leaderboardDashboard(user.username),
                    workoutSessionsDashboard(user.id)
                ])
                setProfile(profileData)
                setCalScore(calData)
                setWorkoutSession(sessionData)
            } catch (err) {
                console.error('Dashboard load failed:', err)
            }

            try {
                const scoreData = await totalScoreDashboard()
                setTotalScore(scoreData)
            } catch {
                setTotalScore({ data: [], page: 1, limit: 10, total: 0, totalPages: 0 })
            }

            setLoading(false)
        }
        load()
    }, [user?.id])
    if (loading) return <p>Loading...</p>
    if (!profile || !workoutSession || !scoreCal) return <p>Failed to load dashboard.</p>
    return (
        <>
            <h1 className="text-2xl font-bold mb-4">
                Welcome, {user?.username}
            </h1>

            {/* Stats card */}
            <BannerSlider />

            <div className="grid grid-cols-2 gap-4 mt-4">
                <StatsCard
                    label="BMR"
                    value={profile.bmr}
                    unit="kcal"
                />
                <StatsCard
                    label="Total Sessions"
                    value={profile.total_sessions}
                />
                <StatsCard
                    label="Active Plan"
                    value={profile.active_plan?.plan_name ?? 'No Plan'}
                />
                <StatsCard
                    label="Streak"
                    value={myLeaderboardRow?.consistency ?? '-'}
                />

                <StatsCard
                    label="Latest Score"
                    value={latestScore ?? '-'}
                />
                <StatsCard
                    label="Total calories"
                    value={myLeaderboardRow?.calories ?? '-'}
                />
            </div>

            {/* Recent Sessions */}
            <h2 className="mt-6 font-semibold">Recent Sessions</h2>

            {workoutSession.length === 0
                ? <p>No sessions yet.</p>
                : workoutSession.slice(0, 3).map((session) => (
                    <div key={session.id} className="border p-3 rounded mt-2">
                        <p>{session.session_no}</p>
                        <p>{new Date(session.session_datetime).toLocaleString()}</p>
                    </div>
                ))
            }
        </>
    )
}