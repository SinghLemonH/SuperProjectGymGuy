import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSessionById, deleteSession, type ExerciseLogResponse, type SessionDetailResponse } from '../api/workout.api'
import { Badge } from '@/components/ui'

// "Mon, 02 Jun 2025 · 14:30" format
const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// keeps it readable: 90s → "1m 30s", 60s → "1m", 45s → "45s"
const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<SessionDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    getSessionById(id)
      .then(setSession)
      .catch(() => setError('Unable to load session data.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!session) return
    if (!confirm('Delete this session?')) return
    setDeleting(true)
    try {
      await deleteSession(session.id)
      navigate('/sessions')
    } catch {
      alert('Failed to delete. Please try again.')
      setDeleting(false) // only reset if delete failed, otherwise we're navigating away anyway
    }
  }

  //Loading
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center py-20 text-gray-400 text-sm">Loading session…</div>
      </div>
    )
  }

  // show a minimal error screen with a way to get back
  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <button
          onClick={() => navigate('/sessions')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="text-center py-16 text-red-500 text-sm">{error || 'Session not found.'}</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">

      {/* Back button */}
      <button
        onClick={() => navigate('/sessions')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Sessions
      </button>

      {/* session title, plan badge, date, and delete button */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">

        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-2xl">🏋️</span>
              <h1 className="text-base font-bold text-gray-900">
                {session.session_number !== undefined ? `Session #${session.session_number}` : 'Workout Session'}
              </h1>
              {session.workout_plan && (
                <Badge variant="purple">{session.workout_plan.name}</Badge>
              )}
            </div>
            <p className="text-xs text-gray-400 ml-9">{formatDateTime(session.session_datetime)}</p>
          </div>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>

        {/* 3 stat cards: calories / points / exercise count */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="flex flex-col items-center bg-amber-50 rounded-xl py-3 px-2">
            <span className="text-xl mb-1">🔥</span>
            <span className="text-lg font-bold text-amber-500">{session.total_calories.toLocaleString()}</span>
            <span className="text-[10px] text-amber-400 font-medium">kcal burned</span>
          </div>

          {session.total_points !== undefined && (
            <div className="flex flex-col items-center bg-purple-50 rounded-xl py-3 px-2">
              <span className="text-xl mb-1">⚡</span>
              <span className="text-lg font-bold text-[#534AB7]">+{session.total_points}</span>
              <span className="text-[10px] text-[#7B72D8] font-medium">points earned</span>
            </div>
          )}

          <div className="flex flex-col items-center bg-gray-50 rounded-xl py-3 px-2">
            <span className="text-xl mb-1">💪</span>
            <span className="text-lg font-bold text-gray-700">{session.exercises.length}</span>
            <span className="text-[10px] text-gray-400 font-medium">exercises</span>
          </div>
        </div>
      </div>

      {/*Exercise list*/}
      {/* breakdown of every exercise logged in this session */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <span className="text-base">📋</span>
          <h2 className="text-sm font-bold text-gray-700">Exercises</h2>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {session.exercises.length} total
          </span>
        </div>

        {session.exercises.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No exercises logged.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {session.exercises.map((ex: ExerciseLogResponse, index: number) => (
              <div key={ex.exercise_id} className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">

                {/* Index badge */}
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-gray-500">{index + 1}</span>
                </div>

                {/* Exercise name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{ex.name}</p>
                </div>


                {/* Stats chips */}
                <div className="flex items-center gap-2 flex-shrink-0">

                  {/* sets × reps · duration · calories — all as little colored chips */}
                  {/* Sets × Reps */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2.5 py-1.5">
                    <span className="text-sm font-bold text-gray-800">{ex.actual_set}</span>
                    <span className="text-gray-400 text-xs font-medium">sets</span>
                    <span className="text-gray-300 mx-0.5">×</span>
                    <span className="text-sm font-bold text-gray-800">{ex.actual_reps}</span>
                    <span className="text-gray-400 text-xs font-medium">reps</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 bg-blue-50 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs">⏱️</span>
                    <span className="text-sm font-bold text-blue-600">{formatDuration(ex.actual_duration)}</span>
                  </div>

                  {/* Calories */}
                  <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs">🔥</span>
                    <span className="text-sm font-bold text-amber-500">{ex.calories}</span>
                    <span className="text-amber-400 text-xs font-medium">kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
