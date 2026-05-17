import { useEffect, useState } from 'react'
import type { WichitReportsIn, KittiReportsIn, WathitReportsIn, MayReportsIn } from '../api/report.api'
import {
    exerPopularity, userWeightBMI, leaderboardConsisCal,
    userBMR, exerciseCaloriesBurned, totalEnergyBurned,
    scoreExerciseSummary, exerciseMusclePlanList, workoutDistribution,
    totalCaloriesBurned, totalWorkoutSessions, planAchievement
} from '../api/report.api'
import { getUser } from '../api/auth'

function useUserId(): string | undefined {
    return getUser()?.id ?? undefined
}

// ─── Shared CSS constants ────────────────────────────────────────────
const selectCls = 'border rounded-md px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#534AB7]'
const inputCls  = selectCls
const clearBtnCls = 'px-3 py-1.5 text-sm text-red-500 border border-red-300 rounded-md hover:bg-red-50'
const thCls     = 'py-2 pr-4 text-left text-gray-500 font-medium'
const tdCls     = 'py-2 pr-4'

// ─── Shared: Filter bar wrapper ──────────────────────────────────────
function FilterBar({ children, onClear, active }: {
    children: React.ReactNode
    onClear: () => void
    active: boolean
}) {
    return (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg border">
            <span className="text-sm font-medium text-gray-600 self-center">Filter:</span>
            {children}
            {active && (
                <button onClick={onClear} className={clearBtnCls}>Clear</button>
            )}
        </div>
    )
}

// ─── Shared: Text input that fires on Enter or blur (avoids re-fetch on every keystroke) ──
function SearchInput({ value, onChange, placeholder }: {
    value: string | undefined
    onChange: (val: string | undefined) => void
    placeholder: string
}) {
    const [local, setLocal] = useState(value ?? '')
    return (
        <input
            type="text"
            value={local}
            placeholder={placeholder}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={() => onChange(local || undefined)}
            onKeyDown={(e) => { if (e.key === 'Enter') onChange(local || undefined) }}
            className={inputCls}
        />
    )
}

// ─── Shared: Pagination controls for Kitti reports ──────────────────
function Pagination({ page, totalPages, onPageChange }: {
    page: number
    totalPages: number
    onPageChange: (p: number) => void
}) {
    if (totalPages <= 1) return null
    return (
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
            <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
                Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
                Next
            </button>
        </div>
    )
}

// ─── Shared: Empty / loading states ─────────────────────────────────
function NoResults() {
    return <p className="text-gray-400 text-sm mt-2">No results found.</p>
}


// ════════════════════════════════════════════════════════════════════
// 1. Exercise Popularity  (Wichit)
// ════════════════════════════════════════════════════════════════════
function ExercisePopularityTable() {
    const [loading, setLoading]       = useState(true)
    const [category, setCategory]     = useState<string>()
    const [difficulty, setDifficulty] = useState<string>()
    const [exercise_name, setExerciseName] = useState<string>()
    const [exerciseList, setExerciseList] = useState<string[]>([])
    const [data, setData]             = useState<WichitReportsIn>()

    // Fetch exercise name list once for dropdown
    useEffect(() => {
        exerPopularity().then((res) => {
            const names = res.data.map((row) => row.exercise_name)
            setExerciseList(names)
        })
    }, [])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const result = await exerPopularity(category, difficulty, exercise_name)
                setData(result)
            } catch (err) {
                console.error('Exercise popularity load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [category, difficulty, exercise_name])

    if (loading) return <p>Loading...</p>

    return (
        <>
            <FilterBar
                active={!!(category || difficulty || exercise_name)}
                onClear={() => { setCategory(undefined); setDifficulty(undefined); setExerciseName(undefined) }}
            >
                <select value={category ?? ''} onChange={(e) => setCategory(e.target.value || undefined)} className={selectCls}>
                    <option value="">All Categories</option>
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="body_weight">Body Weight</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="plyometric">Plyometric</option>
                    <option value="olympic_lifting">Olympic Lifting</option>
                    <option value="strongman">Strongman</option>
                </select>
                <select value={difficulty ?? ''} onChange={(e) => setDifficulty(e.target.value || undefined)} className={selectCls}>
                    <option value="">All Levels</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                    <option value="5">Level 5</option>
                </select>
                <select value={exercise_name ?? ''} onChange={(e) => setExerciseName(e.target.value || undefined)} className={selectCls}>
                    <option value="">All Exercises</option>
                    {exerciseList.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </FilterBar>

            {data?.data.length === 0 ? <NoResults /> :
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={thCls}>Exercise Name</th>
                            <th className={thCls}>Exercise Code</th>
                            <th className={thCls}>Category</th>
                            <th className={thCls}>Difficulty</th>
                            <th className={thCls}>Calorie Rate</th>
                            <th className={thCls}>Total Usage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className={tdCls}>{row.exercise_name}</td>
                                <td className={tdCls}>{row.exercise_code}</td>
                                <td className={tdCls}>{row.category}</td>
                                <td className={tdCls}>{row.difficulty_level}</td>
                                <td className={tdCls}>{row.calorie_rate}</td>
                                <td className={tdCls}>{row.total_usage}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 2. User Weight & BMI  (Wichit)
// ════════════════════════════════════════════════════════════════════
function UserWeightBMITable() {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState<string>()
    const [from_date, setFromDate] = useState<string>()
    const [to_date, setToDate]     = useState<string>()
    const [data, setData]          = useState<WichitReportsIn>()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const result = await userWeightBMI(username, from_date, to_date)
                setData(result)
            } catch (err) {
                console.error('User Weight BMI load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [username, from_date, to_date])

    if (loading) return <p>Loading...</p>

    return (
        <>
            <FilterBar
                active={!!(username || from_date || to_date)}
                onClear={() => { setUsername(undefined); setFromDate(undefined); setToDate(undefined) }}
            >
                <SearchInput value={username} onChange={setUsername} placeholder="Search username..." />
                <label className="text-sm text-gray-500 self-center">Joined from</label>
                <input type="date" value={from_date ?? ''} onChange={(e) => setFromDate(e.target.value || undefined)} className={inputCls} />
                <label className="text-sm text-gray-500 self-center">to</label>
                <input type="date" value={to_date ?? ''} onChange={(e) => setToDate(e.target.value || undefined)} className={inputCls} />
            </FilterBar>

            {data?.data.length === 0 ? <NoResults /> :
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={thCls}>Username</th>
                            <th className={thCls}>Age</th>
                            <th className={thCls}>Weight (kg)</th>
                            <th className={thCls}>Height (cm)</th>
                            <th className={thCls}>Sex</th>
                            <th className={thCls}>BMI</th>
                            <th className={thCls}>BMI Status</th>
                            <th className={thCls}>Member Since</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className={tdCls}>{row.username}</td>
                                <td className={tdCls}>{row.age}</td>
                                <td className={tdCls}>{row.weight}</td>
                                <td className={tdCls}>{row.height}</td>
                                <td className={tdCls}>{row.sex}</td>
                                <td className={tdCls}>{row.bmi}</td>
                                <td className={tdCls}>{row.bmi_status}</td>
                                <td className={tdCls}>{new Date(row.member_since).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 3. Leaderboard Consistency & Calories  (Wichit)
// ════════════════════════════════════════════════════════════════════
function LeaderboardConsistencyTable() {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState<string>()
    const [month, setMonth]       = useState<string>()
    const [sort_by, setSortBy]    = useState<string>()
    const [order, setOrder]       = useState<string>()
    const [data, setData]         = useState<WichitReportsIn>()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const result = await leaderboardConsisCal(username, month, sort_by, order)
                setData(result)
            } catch (err) {
                console.error('Leaderboard consistency load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [username, month, sort_by, order])

    if (loading) return <p>Loading...</p>

    return (
        <>
            <FilterBar
                active={!!(username || month || sort_by || order)}
                onClear={() => { setUsername(undefined); setMonth(undefined); setSortBy(undefined); setOrder(undefined) }}
            >
                <SearchInput value={username} onChange={setUsername} placeholder="Search username..." />
                <input type="month" value={month ?? ''} onChange={(e) => setMonth(e.target.value || undefined)} className={inputCls} />
                <select value={sort_by ?? ''} onChange={(e) => setSortBy(e.target.value || undefined)} className={selectCls}>
                    <option value="">Sort by...</option>
                    <option value="calories">Calories</option>
                    <option value="consistency">Consistency</option>
                </select>
                <select value={order ?? ''} onChange={(e) => setOrder(e.target.value || undefined)} className={selectCls}>
                    <option value="">Order...</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </FilterBar>

            {data?.data.length === 0 ? <NoResults /> :
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={thCls}>Rank</th>
                            <th className={thCls}>Username</th>
                            <th className={thCls}>Level</th>
                            <th className={thCls}>Calories</th>
                            <th className={thCls}>Active Days</th>
                            <th className={thCls}>Consistency (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className={tdCls}>
                                    {row.rank <= 3
                                        ? ['🥇', '🥈', '🥉'][row.rank - 1]
                                        : `#${row.rank}`}
                                </td>
                                <td className={tdCls}>{row.username}</td>
                                <td className={tdCls}>{row.user_level}</td>
                                <td className={tdCls}>{Number(row.calories).toLocaleString()}</td>
                                <td className={tdCls}>{row.active_days}</td>
                                <td className={tdCls}>{row.consistency}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 4. User BMR  (Wathit — no filters)
// ════════════════════════════════════════════════════════════════════
function UserBMRTable() {
    const [loading, setLoading] = useState(true)
    const [data, setData]       = useState<WathitReportsIn>()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const result = await userBMR()
                setData(result)
            } catch (err) {
                console.error('User BMR load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <>
            {data?.data.length === 0 ? <NoResults /> :
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={thCls}>Username</th>
                            <th className={thCls}>Age</th>
                            <th className={thCls}>Weight (kg)</th>
                            <th className={thCls}>Height (cm)</th>
                            <th className={thCls}>Sex</th>
                            <th className={thCls}>BMR (kcal/day)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className={tdCls}>{row.username}</td>
                                <td className={tdCls}>{row.age}</td>
                                <td className={tdCls}>{row.weight}</td>
                                <td className={tdCls}>{row.height}</td>
                                <td className={tdCls}>{row.sex}</td>
                                <td className={tdCls}>{row.bmr_kcal_per_day}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 5. Exercise Calories Burned  (Wathit — no filters)
// ════════════════════════════════════════════════════════════════════
function ExerciseCaloriesBurnedTable() {
    const [loading, setLoading] = useState(true)
    const [data, setData]       = useState<WathitReportsIn>()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const result = await exerciseCaloriesBurned()
                setData(result)
            } catch (err) {
                console.error('Exercise calories burned load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <>
            {data?.data.length === 0 ? <NoResults /> :
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={thCls}>Username</th>
                            <th className={thCls}>Total Sessions</th>
                            <th className={thCls}>Exercise Calories Burned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className={tdCls}>{row.username}</td>
                                <td className={tdCls}>{row.total_session}</td>
                                <td className={tdCls}>{Number(row.exercise_calories_burned).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 6. Total Energy Burned  (Wathit — no filters)
// ════════════════════════════════════════════════════════════════════
function TotalEnergyBurnedTable() {
    const [loading, setLoading] = useState(true)
    const [data, setData]       = useState<WathitReportsIn>()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const result = await totalEnergyBurned()
                setData(result)
            } catch (err) {
                console.error('Total energy burned load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <>
            {data?.data.length === 0 ? <NoResults /> :
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={thCls}>Username</th>
                            <th className={thCls}>BMR (kcal/day)</th>
                            <th className={thCls}>Exercise Calories</th>
                            <th className={thCls}>Total Energy Burned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className={tdCls}>{row.username}</td>
                                <td className={tdCls}>{row.bmr}</td>
                                <td className={tdCls}>{Number(row.exercise_calories).toLocaleString()}</td>
                                <td className={tdCls}>{Number(row.total_energy_burned).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 7. Score Exercise Summary  (Kitti — paginated)
// ════════════════════════════════════════════════════════════════════
function ScoreExerciseSummaryTable() {
    const [loading, setLoading] = useState(true)
    const [code, setCode]           = useState<string>()
    const [start_date, setStartDate] = useState<string>()
    const [end_date, setEndDate]     = useState<string>()
    const [sortDir, setSortDir]      = useState<string>()
    const [page, setPage]            = useState(1)
    const [data, setData]            = useState<KittiReportsIn>()
    const userId = useUserId()

    useEffect(() => {
        const load = async () => {
            if (!userId) return
            setLoading(true)
            try {
                const result = await scoreExerciseSummary(userId, code, start_date, end_date, page, 10, sortDir)
                setData(result)
            } catch (err) {
                console.error('Score exercise summary load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [userId, code, start_date, end_date, sortDir, page])

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1) }, [code, start_date, end_date, sortDir])

    if (!userId) return <p>Please log in to view this report.</p>
    if (loading) return <p>Loading...</p>

    return (
        <>
            <FilterBar
                active={!!(code || start_date || end_date || sortDir)}
                onClear={() => { setCode(undefined); setStartDate(undefined); setEndDate(undefined); setSortDir(undefined) }}
            >
                <SearchInput value={code} onChange={setCode} placeholder="Workout plan code..." />
                <label className="text-sm text-gray-500 self-center">From</label>
                <input type="date" value={start_date ?? ''} onChange={(e) => setStartDate(e.target.value || undefined)} className={inputCls} />
                <label className="text-sm text-gray-500 self-center">To</label>
                <input type="date" value={end_date ?? ''} onChange={(e) => setEndDate(e.target.value || undefined)} className={inputCls} />
                <select value={sortDir ?? ''} onChange={(e) => setSortDir(e.target.value || undefined)} className={selectCls}>
                    <option value="">Sort...</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </FilterBar>

            {data?.data.length === 0 ? <NoResults /> :
                <>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className={thCls}>Plan Code</th>
                                <th className={thCls}>Plan Name</th>
                                <th className={thCls}>Exercise Code</th>
                                <th className={thCls}>Exercise Name</th>
                                <th className={thCls}>Category</th>
                                <th className={thCls}>Total Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.data.map((row, i) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                    <td className={tdCls}>{row.workout_plan_code}</td>
                                    <td className={tdCls}>{row.workout_plan_name}</td>
                                    <td className={tdCls}>{row.exercise_code}</td>
                                    <td className={tdCls}>{row.exercise_name}</td>
                                    <td className={tdCls}>{row.exercise_category}</td>
                                    <td className={tdCls}>{row.total_score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
                </>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 8. Exercise Muscle Plan List  (Kitti — paginated)
// ════════════════════════════════════════════════════════════════════
function ExerciseMusclePlanTable() {
    const [loading, setLoading]   = useState(true)
    const [muscle_area, setMuscle] = useState<string>()
    const [sortDir, setSortDir]    = useState<string>()
    const [page, setPage]          = useState(1)
    const [data, setData]          = useState<KittiReportsIn>()
    const userId = useUserId()

    useEffect(() => {
        const load = async () => {
            if (!userId) return
            setLoading(true)
            try {
                const result = await exerciseMusclePlanList(userId, muscle_area, page, 10, sortDir)
                setData(result)
            } catch (err) {
                console.error('Exercise muscle plan load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [userId, muscle_area, sortDir, page])

    useEffect(() => { setPage(1) }, [muscle_area, sortDir])

    if (!userId) return <p>Please log in to view this report.</p>
    if (loading) return <p>Loading...</p>

    return (
        <>
            <FilterBar
                active={!!(muscle_area || sortDir)}
                onClear={() => { setMuscle(undefined); setSortDir(undefined) }}
            >
                <select value={muscle_area ?? ''} onChange={(e) => setMuscle(e.target.value || undefined)} className={selectCls}>
                    <option value="">All Muscle Areas</option>
                    <option value="chest">Chest</option>
                    <option value="quads">Quads</option>
                    <option value="heart">Heart</option>
                    <option value="abs">Abs</option>
                    <option value="lower_back">Lower Back</option>
                </select>
                <select value={sortDir ?? ''} onChange={(e) => setSortDir(e.target.value || undefined)} className={selectCls}>
                    <option value="">Sort...</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </FilterBar>

            {data?.data.length === 0 ? <NoResults /> :
                <>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className={thCls}>Plan Code</th>
                                <th className={thCls}>Plan Name</th>
                                <th className={thCls}>Start Date</th>
                                <th className={thCls}>End Date</th>
                                <th className={thCls}>Muscle</th>
                                <th className={thCls}>Exercise Code</th>
                                <th className={thCls}>Exercise Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.data.map((row, i) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                    <td className={tdCls}>{row.workout_plan_code}</td>
                                    <td className={tdCls}>{row.workout_plan_name}</td>
                                    <td className={tdCls}>{row.start_date ? new Date(row.start_date).toLocaleDateString() : '-'}</td>
                                    <td className={tdCls}>{row.end_date ? new Date(row.end_date).toLocaleDateString() : '-'}</td>
                                    <td className={tdCls}>{row.muscle_name}</td>
                                    <td className={tdCls}>{row.exercise_code}</td>
                                    <td className={tdCls}>{row.exercise_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
                </>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 9. Workout Distribution  (Kitti — paginated)
// ════════════════════════════════════════════════════════════════════
function WorkoutDistributionTable() {
    const [loading, setLoading] = useState(true)
    const [sortDir, setSortDir] = useState<string>()
    const [page, setPage]       = useState(1)
    const [data, setData]       = useState<KittiReportsIn>()
    const userId = useUserId()

    useEffect(() => {
        const load = async () => {
            if (!userId) return
            setLoading(true)
            try {
                const result = await workoutDistribution(userId, page, 10, sortDir)
                setData(result)
            } catch (err) {
                console.error('Workout distribution load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [userId, sortDir, page])

    useEffect(() => { setPage(1) }, [sortDir])

    if (!userId) return <p>Please log in to view this report.</p>
    if (loading) return <p>Loading...</p>

    return (
        <>
            <FilterBar
                active={!!sortDir}
                onClear={() => setSortDir(undefined)}
            >
                <select value={sortDir ?? ''} onChange={(e) => setSortDir(e.target.value || undefined)} className={selectCls}>
                    <option value="">Sort by score...</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </FilterBar>

            {data?.data.length === 0 ? <NoResults /> :
                <>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className={thCls}>Plan Code</th>
                                <th className={thCls}>Plan Name</th>
                                <th className={thCls}>Start Date</th>
                                <th className={thCls}>End Date</th>
                                <th className={thCls}>Total Score</th>
                                <th className={thCls}>Completeness (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.data.map((row, i) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                    <td className={tdCls}>{row.workout_plan_code}</td>
                                    <td className={tdCls}>{row.workout_plan_name}</td>
                                    <td className={tdCls}>{row.start_date ? new Date(row.start_date).toLocaleDateString() : '-'}</td>
                                    <td className={tdCls}>{row.end_date ? new Date(row.end_date).toLocaleDateString() : '-'}</td>
                                    <td className={tdCls}>{row.total_score}</td>
                                    <td className={tdCls}>{row.plan_completeness}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
                </>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 10. Total Calories Burned  (May — no filters)
// ════════════════════════════════════════════════════════════════════
function TotalCaloriesBurnedTable() {
    const [loading, setLoading] = useState(true)
    const [data, setData]       = useState<MayReportsIn>()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const result = await totalCaloriesBurned()
                setData(result)
            } catch (err) {
                console.error('Total calories burned load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <>
            {data?.data.length === 0 ? <NoResults /> :
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={thCls}>Username</th>
                            <th className={thCls}>Total Sessions</th>
                            <th className={thCls}>Total Calories Burned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className={tdCls}>{row.username}</td>
                                <td className={tdCls}>{row.total_sessions}</td>
                                <td className={tdCls}>{Number(row.total_calories_burned).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 11. Total Workout Sessions  (May — no filters)
// ════════════════════════════════════════════════════════════════════
function TotalWorkoutSessionsTable() {
    const [loading, setLoading] = useState(true)
    const [data, setData]       = useState<MayReportsIn>()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const result = await totalWorkoutSessions()
                setData(result)
            } catch (err) {
                console.error('Total workout sessions load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <>
            {data?.data.length === 0 ? <NoResults /> :
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={thCls}>Username</th>
                            <th className={thCls}>Total Sessions</th>
                            <th className={thCls}>First Session</th>
                            <th className={thCls}>Last Session</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className={tdCls}>{row.username}</td>
                                <td className={tdCls}>{row.total_sessions}</td>
                                <td className={tdCls}>{new Date(row.first_session).toLocaleString()}</td>
                                <td className={tdCls}>{new Date(row.last_session).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// 12. Plan Achievement  (May — no filters)
// ════════════════════════════════════════════════════════════════════
function PlanAchievementTable() {
    const [loading, setLoading] = useState(true)
    const [data, setData]       = useState<MayReportsIn>()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const result = await planAchievement()
                setData(result)
            } catch (err) {
                console.error('Plan achievement load failed:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <>
            {data?.data.length === 0 ? <NoResults /> :
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className={thCls}>Username</th>
                            <th className={thCls}>Plan Name</th>
                            <th className={thCls}>Actual Calories</th>
                            <th className={thCls}>Goal Calories</th>
                            <th className={thCls}>Achievement</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className={tdCls}>{row.username}</td>
                                <td className={tdCls}>{row.plan_name}</td>
                                <td className={tdCls}>{Number(row.actual_calories).toLocaleString()}</td>
                                <td className={tdCls}>{Number(row.goal_calories).toLocaleString()}</td>
                                <td className={tdCls}>{row.achievement_percentage}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}


// ════════════════════════════════════════════════════════════════════
// Report Page — tab bar + content switcher
// ════════════════════════════════════════════════════════════════════
const tabs = [
    { id: 'exercise-popularity',     label: 'Exercise Popularity' },
    { id: 'weight-bmi',              label: 'Weight & BMI' },
    { id: 'leaderboard-consistency', label: 'Leaderboard Consistency' },
    { id: 'user-bmr',                label: 'User BMR' },
    { id: 'exercise-calories-burned', label: 'Exercise Calories Burned' },
    { id: 'total-energy-burned',     label: 'Total Energy Burned' },
    { id: 'score-exercise-sum',      label: 'Score Exercise Summary' },
    { id: 'exercise-muscle-plan',    label: 'Exercise Muscle Plan' },
    { id: 'workout-distribution',    label: 'Workout Distribution' },
    { id: 'total-calories-burned',   label: 'Total Calories Burned' },
    { id: 'total-workout-sessions',  label: 'Total Workout Sessions' },
    { id: 'plan-achievement',        label: 'Plan Achievement' },
]

export default function ReportPage() {
    const [activeTab, setActiveTab] = useState('exercise-popularity')

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Reports</h1>

            {/* Scrollable tab bar — scroll only, not the content */}
            <div className="overflow-x-auto border-b">
                <div className="flex min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={[
                                'px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                                activeTab === tab.id
                                    ? 'border-[#534AB7] text-[#534AB7] font-semibold'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className="mt-4">
                {activeTab === 'exercise-popularity'     && <ExercisePopularityTable />}
                {activeTab === 'weight-bmi'              && <UserWeightBMITable />}
                {activeTab === 'leaderboard-consistency' && <LeaderboardConsistencyTable />}
                {activeTab === 'user-bmr'                && <UserBMRTable />}
                {activeTab === 'exercise-calories-burned' && <ExerciseCaloriesBurnedTable />}
                {activeTab === 'total-energy-burned'     && <TotalEnergyBurnedTable />}
                {activeTab === 'score-exercise-sum'      && <ScoreExerciseSummaryTable />}
                {activeTab === 'exercise-muscle-plan'    && <ExerciseMusclePlanTable />}
                {activeTab === 'workout-distribution'    && <WorkoutDistributionTable />}
                {activeTab === 'total-calories-burned'   && <TotalCaloriesBurnedTable />}
                {activeTab === 'total-workout-sessions'  && <TotalWorkoutSessionsTable />}
                {activeTab === 'plan-achievement'        && <PlanAchievementTable />}
            </div>
        </div>
    )
}
