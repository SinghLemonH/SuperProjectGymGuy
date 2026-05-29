import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser } from '../api/auth'
import { logSession } from '../api/workout.api'
import { getExercises } from '../api/exercise.api'
import { getUserPlans } from '../api/plan.api'
import { Button, Input } from '@/components/ui'

interface Exercise {
  id: string
  name: string
}

interface Plan {
  id: string
  name: string
}

interface ExerciseRow {
  rowId: number
  exercise_id: string
  actual_set: number | ''
  actual_reps: number | ''
  actual_duration: number | ''
}

// datetime-local input expects "YYYY-MM-DDTHH:mm" in local time
const toLocalDatetimeValue = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// module-level counter so row IDs stay unique even after rows are removed
let rowCounter = 1

export default function LogSession() {
  const navigate = useNavigate()
  const user = getUser()

  const [datetime, setDatetime] = useState(toLocalDatetimeValue(new Date()))
  const [planId, setPlanId] = useState('')
  const [rows, setRows] = useState<ExerciseRow[]>([
    { rowId: rowCounter++, exercise_id: '', actual_set: '', actual_reps: '', actual_duration: '' },
  ])

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    getExercises().then(setExercises).catch(() => {})
    if (user?.id) getUserPlans(user.id).then(setPlans).catch(() => {})
  }, [])

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { rowId: rowCounter++, exercise_id: '', actual_set: '', actual_reps: '', actual_duration: '' },
    ])

  const removeRow = (rowId: number) =>
    setRows((prev) => prev.filter((r) => r.rowId !== rowId))

  const updateRow = (rowId: number, field: keyof Omit<ExerciseRow, 'rowId'>, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowId !== rowId) return r
        if (field === 'exercise_id') return { ...r, exercise_id: value }
        // clamp to 0 so users can't type negative numbers
        const num = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0)
        return { ...r, [field]: num }
      })
    )
    // clear the error for this field as soon as the user starts fixing it
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`row_${rowId}_${field}`]
      return next
    })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!datetime) e.datetime = 'Please select a date and time.'
    if (rows.length === 0) e.rows = 'Add at least one exercise.'
    rows.forEach((r) => {
      if (!r.exercise_id) e[`row_${r.rowId}_exercise_id`] = 'Select exercise'
      if (!r.actual_set || Number(r.actual_set) < 1) e[`row_${r.rowId}_actual_set`] = '> 0'
      if (!r.actual_reps || Number(r.actual_reps) < 1) e[`row_${r.rowId}_actual_reps`] = '> 0'
      if (!r.actual_duration || Number(r.actual_duration) < 1) e[`row_${r.rowId}_actual_duration`] = '> 0'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        user_id: user!.id,
        session_datetime: new Date(datetime).toISOString(),
        ...(planId ? { workout_plan_id: planId } : {}),// omit the key entirely if no plan selected
        exercises: rows.map((r) => ({
          exercise_id: r.exercise_id,
          actual_set: Number(r.actual_set),
          actual_reps: Number(r.actual_reps),
          actual_duration: Number(r.actual_duration),
        })),
      }
      await logSession(payload)
      navigate('/sessions')
    } catch {
      setErrors({ submit: 'Failed to save. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">

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

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

        {/* Card header */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <span className="text-2xl">📝</span>
          <div>
            <h1 className="text-base font-bold text-gray-900">Log New Session</h1>
            <p className="text-xs text-gray-400">Record your workout details below</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="mb-5">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
            📅 Date & Time
          </label>
          <Input
            type="datetime-local"
            value={datetime}
            onChange={(e) => {
              setDatetime(e.target.value)
              setErrors((prev) => { const n = { ...prev }; delete n.datetime; return n })
            }}
            error={errors.datetime}
          />
        </div>

        {/* Workout Plan */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
            🗓️ Workout Plan
            <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
          </label>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className={[
              'w-full rounded-xl border border-gray-200 hover:border-gray-300 px-3 py-2 text-sm',
              'text-gray-900 bg-white outline-none appearance-none cursor-pointer',
              'focus:ring-2 focus:ring-[#534AB7]/25 focus:border-[#534AB7] transition-all duration-150',
            ].join(' ')}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: '2rem',
            }}
          >
            <option value="">— No plan —</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* exercise rows — each row is one exercise with its sets / reps / duration */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              💪 Exercises
              <span className="ml-1 text-xs font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {rows.length}
              </span>
            </label>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#534AB7] hover:text-[#3C3489] bg-purple-50 hover:bg-purple-100 rounded-lg px-3 py-1.5 transition-colors"
            >
              + Add Exercise
            </button>
          </div>

          {errors.rows && (
            <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
              <span>⚠️</span> {errors.rows}
            </p>
          )}

          <div className="flex flex-col gap-2.5">
            {rows.map((row, index) => (
              <div
                key={row.rowId}
                className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
              >
                {/* top row: index + exercise dropdown + remove button */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-400 w-4">#{index + 1}</span>
                  {/* Exercise select */}
                  <select
                    value={row.exercise_id}
                    onChange={(e) => updateRow(row.rowId, 'exercise_id', e.target.value)}
                    className={[
                      'flex-1 rounded-lg border bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none cursor-pointer',
                      'focus:ring-2 focus:ring-[#534AB7]/25 focus:border-[#534AB7] transition-all duration-150',
                      errors[`row_${row.rowId}_exercise_id`] ? 'border-red-400' : 'border-gray-200',
                    ].join(' ')}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      paddingRight: '1.75rem',
                      appearance: 'none',
                    }}
                  >
                    <option value="">Select exercise…</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>

                  {/* Remove row */}
                  {/* hidden when there's only one row left */}
                  <button
                    type="button"
                    onClick={() => removeRow(row.rowId)}
                    disabled={rows.length === 1}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-0 disabled:pointer-events-none transition-all"
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* bottom row: sets / reps / duration inputs */}
                <div className="flex gap-2 ml-6">
                  {(
                    [
                      { field: 'actual_set' as const, label: 'Sets', emoji: '🔁' },
                      { field: 'actual_reps' as const, label: 'Reps', emoji: '↩️' },
                      { field: 'actual_duration' as const, label: 'Seconds', emoji: '⏱️' },
                    ] as const
                  ).map(({ field, label, emoji }) => (
                    <div key={field} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-gray-400 font-medium">{emoji} {label}</span>
                      <input
                        type="number"
                        min={1}
                        value={row[field]}
                        onChange={(e) => updateRow(row.rowId, field, e.target.value)}
                        placeholder="0"
                        className={[
                          'w-full rounded-lg border bg-white px-2 py-1.5 text-sm text-center text-gray-900 outline-none',
                          'focus:ring-2 focus:ring-[#534AB7]/25 focus:border-[#534AB7] transition-all duration-150',
                          errors[`row_${row.rowId}_${field}`] ? 'border-red-400' : 'border-gray-200',
                        ].join(' ')}
                      />
                      {errors[`row_${row.rowId}_${field}`] && (
                        <span className="text-[10px] text-red-400">
                          {errors[`row_${row.rowId}_${field}`]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit error */}
        {errors.submit && (
          <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
            <span>⚠️</span> {errors.submit}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/sessions')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={submitting}
            onClick={handleSubmit}
          >
            💾 Save Session
          </Button>
        </div>
      </div>
    </div>
  )
}
