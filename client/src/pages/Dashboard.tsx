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

    useEffect(() => {
        if (!user) return

        const load = async () => {
            try {
                const [profileData, scoreData, calData, sessionData] = await Promise.all([
                    userDashBoard(user.id),
                    totalScoreDashboard(),
                    leaderboardDashboard(user.username),
                    workoutSessionsDashboard(user.id)
                ])
                
                setWorkoutSession(sessionData)
                setCalScore(calData)
                setProfile(profileData)
                setTotalScore(scoreData)
            } catch (err) {
                console.error('Dashboard load failed:', err)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [user?.id])
    const myLeaderboardRow = scoreCal?.data.find(row => row.username === user?.username)

    if (loading) return <p>Loading...</p>
    if (!profile || !scoreTotal || !workoutSession || !scoreCal) return <p>Failed to load.</p>
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
                    value={scoreTotal?.data[0]?.total_score ?? '-'}
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