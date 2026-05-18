// pages/Leaderboard.tsx
import { useEffect, useState, useCallback } from 'react'
import { getUser } from '../api/auth'
import { leaderboardDashboard, userDetailDashboard } from '../api/user.api'
import StatsCard from '../components/ui/StatsCard'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import type { LeaderboardsIn, UserDetailIn } from '../api/user.api'



export default function Leaderboard() {
    const user = getUser()
        const [userDetail, setUserDetail]   = useState<UserDetailIn[]>([])
    const [leaderboardData, setLeaderboard] = useState<LeaderboardsIn | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const load = useCallback(async () => {
        if (!user) return

        try {
            // list all leaderboard
            const lbData = await leaderboardDashboard()
            const userIds = lbData.data.map((row) => row.user_id)

            // fetch user details for all users in the leaderboard
            const userData = await Promise.all(userIds.map((id) => userDetailDashboard(id)))
            setLeaderboard(lbData)
            setUserDetail(userData)
        } catch (err) {
            console.error('Leaderboard load failed:', err)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        load()
    }, [load])

    const myEntry = leaderboardData?.data.find(e => e.user_id === user?.id)
    const filtered = search
        ? leaderboardData?.data.filter(e => e.username.toLowerCase().includes(search.toLowerCase()))
        : leaderboardData?.data


    const userDetailMap = Object.fromEntries(
        userDetail.map((u) => [u.id, u])
    )

        if (loading) return <p>Loading...</p>

    if (!leaderboardData) return <p>Failed to load.</p>

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatsCard label="Your Rank" value={myEntry?.rank ?? '-'} />
                <StatsCard label="Calories" value={myEntry?.calories ?? '-'} unit="kcal" />
                <StatsCard label="Streak" value={myEntry?.consistency ?? '-'} unit="days" />
            </div>

            <Input
                placeholder="Search by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="mt-4 space-y-2">
                {filtered?.length === 0
                    ? <p className="text-gray-400 text-sm">No results found.</p>
                    : filtered?.map((entry) => (
                        <div
                            key={entry.user_id}
                            className={[
                                'flex items-center justify-between border rounded-lg p-3 transition-colors',
                                entry.user_id === user?.id ? 'bg-[#EEEDFE] border-[#534AB7]' : 'bg-white',
                            ].join(' ')}
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg w-8 text-center">
                                    {entry.rank <= 3
                                        ? ['🥇', '🥈', '🥉'][entry.rank - 1]
                                        : `#${entry.rank}`
                                    }
                                </span>
                                <div>
                                    <p className="font-medium text-sm">{entry.username}</p>
                                    <Badge variant="purple">{entry.user_level}</Badge>
                                </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                                <p>{entry.calories.toLocaleString()} kcal</p>
                                <p>{entry.consistency} day streak</p>
                                <p>{userDetailMap[entry.user_id]?.fitness_goal ?? '--'} fitness goal</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}

