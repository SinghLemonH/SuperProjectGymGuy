import { useEffect, useState } from 'react'
import { getUser } from '../api/auth'
import { userDashBoard, leaderboardDashboard, workoutSessionsDashboard } from '../api/user.api'
import { BannerSlider, StatsCard } from '../components/ui'
import type { UserProfileIn, LeaderboardsIn, WorkoutSessionIn } from '../api/user.api'

export default function Dashboard() {
  const user = getUser()

  const [profile, setProfile]           = useState<UserProfileIn | null>(null)
  const [scoreCal, setCalScore]         = useState<LeaderboardsIn | null>(null)
  const [workoutSession, setWorkoutSession] = useState<WorkoutSessionIn[] | null>(null)
  const [loading, setLoading]           = useState(true)
  const [errorMsg, setErrorMsg]         = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setErrorMsg('Please log in to view the dashboard.')
      return
    }

    const load = async () => {
      try {
        const [profileData, calData, sessionData] = await Promise.all([
          userDashBoard(user.id),
          leaderboardDashboard(user.username),
          workoutSessionsDashboard(user.id),
        ])
        setProfile(profileData)
        setCalScore(calData)
        setWorkoutSession(sessionData)
      } catch (err) {
        console.error('Dashboard load failed:', err)
        setErrorMsg('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.id])

  const myLeaderboardRow = scoreCal?.data?.find(row => row.username === user?.username)

  if (loading)  return <p>Loading...</p>
  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>
  if (!profile) return <p className="text-red-500">Failed to load essential data.</p>

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user?.username}
      </h1>

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
          label="Total Calories"
          value={myLeaderboardRow?.calories ?? '-'}
        />
      </div>

      <h2 className="mt-6 font-semibold">Recent Sessions</h2>
      {workoutSession?.length === 0
        ? <p className="text-gray-400 text-sm mt-2">No sessions yet.</p>
        : workoutSession?.slice(0, 3).map((session) => (
            <div key={session.id} className="border border-gray-100 p-3 rounded-xl mt-2 bg-white">
              <p className="text-sm font-medium text-gray-700">Session #{session.session_no}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(session.session_datetime).toLocaleString()}
              </p>
            </div>
          ))
      }
    </>
  )
}