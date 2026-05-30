import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser } from '../api/auth'
import { getUserSessions, deleteSession } from '../api/workout.api'
import { Button, Badge } from '@/components/ui'

interface Exercise {
  name: string
}

interface Session {
  id: string
  session_number?: number
  session_datetime: string
  total_calories: number
  total_points?: number
  exercises: Exercise[]
  workout_plan?: { name: string }
}

const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const getExerciseNames = (exercises: Exercise[]) =>
  exercises.map((e) => e.name).join(', ')

// Top 3 get medals, newest session gets 🆕, everyone else just gets a flexing arm
const rankEmoji = (index: number, sessionId: string, newSessionId: string | null) => {
  if (sessionId === newSessionId) return '🆕'
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return '💪'
}

export default function WorkoutSessions() {
  const navigate = useNavigate()
  const user = getUser()
  const [sessions, setSessions] = useState<Session[]>([])
  const [newSessionId, setNewSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSessions = async () => {
    if (!user?.id) return
    try {
      const data = await getUserSessions(user.id)
      setSessions(data)
      // session แรกสุด (index 0 = datetime DESC) = ใหม่สุดเสมอ
      setNewSessionId(data[0]?.id ?? null)
    } catch {
      setError('Failed to load sessions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSessions() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session?')) return
    try {
      await deleteSession(id)
      // remove it from the list immediately so the UI feels snappy
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id)
        // ถ้าลบ session ที่เป็น new ออก ให้ชี้ไปที่อันใหม่ถัดไปแทน
        if (id === newSessionId) setNewSessionId(next[0]?.id ?? null)
        return next
      })
    } catch {
      alert('Failed to delete. Please try again.')
    }
  }

  // sort by total_points descending for ranking display
  const sortedSessions = [...sessions].sort(
    (a, b) => (b.total_points ?? 0) - (a.total_points ?? 0)
  )

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">

      {/* page title + the log button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🏋️ Session Log
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Track every rep, set, and calorie</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/sessions/log')}>
          + Log Session
        </Button>
      </div>

      {/* quick stats — only show once we actually have sessions */}
      {!loading && !error && sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {
              emoji: '🔥',
              label: 'Total Sessions',
              value: sessions.length,
            },
            {
              emoji: '⚡',
              label: 'Total Calories',
              value: `${sessions.reduce((s, x) => s + x.total_calories, 0).toLocaleString()} kcal`,
            },
            {
              emoji: '🎯',
              label: 'Total Points',
              value: `${sessions.reduce((s, x) => s + (x.total_points ?? 0), 0).toLocaleString()} pts`,
            },
          ].map(({ emoji, label, value }) => (
            <div
              key={label}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-col items-center gap-0.5 shadow-sm"
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-base font-bold text-gray-900">{value}</span>
              <span className="text-[10px] text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/*Loading*/}
      {loading && (
        <div className="text-center py-16 text-gray-400 text-sm">Loading sessions…</div>
      )}

      {/*Error*/}
      {error && (
        <div className="text-center py-8 text-red-500 text-sm">{error}</div>
      )}

      {/* first-time user — nudge them to log something */}
      {!loading && !error && sessions.length === 0 && (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-5xl mb-3">🏋️</p>
          <p className="text-gray-700 font-semibold mb-1">No sessions yet</p>
          <p className="text-gray-400 text-sm mb-5">Log your first workout to get started</p>
          <Button variant="primary" size="md" onClick={() => navigate('/sessions/log')}>
            Log Your First Session
          </Button>
        </div>
      )}

      {/* the actual list — sorted by points for ranking */}
      {!loading && !error && sessions.length > 0 && (
        <div className="flex flex-col gap-0 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {sortedSessions.map((session, index) => (
            <div
              key={session.id}
              className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                index !== 0 ? 'border-t border-gray-100' : ''
              }`}
              onClick={() => navigate(`/sessions/${session.id}`)}
            >
              {/* medal, 🆕, or muscle emoji based on rank */}
              <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-base">
                {rankEmoji(index, session.id, newSessionId)}
              </div>

              {/* session name, plan badge, and datetime + exercises */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    {session.session_number !== undefined ? `#${session.session_number} — ` : ''}
                    Workout Session
                  </p>
                  {session.workout_plan && (
                    <Badge variant="purple">{session.workout_plan.name}</Badge>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 truncate">
                  {formatDateTime(session.session_datetime)}
                  {session.exercises.length > 0 && (
                    <> · {getExerciseNames(session.exercises)}</>
                  )}
                </p>
              </div>

              {/* calories on top, points below */}
              <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                <span className="text-sm font-bold text-amber-500">
                  🔥 {session.total_calories.toLocaleString()} kcal
                </span>
                {session.total_points !== undefined && (
                  <span className="text-[11px] text-[#534AB7] font-semibold">
                    ⚡ +{session.total_points} pts
                  </span>
                )}
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(session.id) }}
                className="flex-shrink-0 ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete session"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
