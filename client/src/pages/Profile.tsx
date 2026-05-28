import { useState, useEffect } from 'react'
import { getUser } from '../api/auth'
import { userDetailDashboard, patchUserProfile } from '../api/user.api'
import type { UserDetailIn } from '../api/user.api'

const fitnessGoalLabel: Record<string, string> = {
  weight_loss:    'Weight Loss',
  muscle_gain:    'Muscle Gain',
  strength:       'Strength',
  endurance:      'Endurance',
  flexibility:    'Flexibility',
  general_health: 'General Health',
}

const userLevelLabel: Record<string, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
  professional: 'Professional',
}

export default function Profile() {
  const me = getUser()
  const [profile, setProfile] = useState<UserDetailIn | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    username:     '',
    age:          '',
    weight:       '',
    height:       '',
    fitness_goal: '',
    user_level:   '',
  })

  useEffect(() => {
    if (!me) return
    userDetailDashboard(me.id)
      .then((data) => {
        setProfile(data)
        setForm({
          username:     data.username,
          age:          String(data.age),
          weight:       String(data.weight),
          height:       String(data.height),
          fitness_goal: data.fitness_goal,
          user_level:   data.user_level,
        })
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!me) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await patchUserProfile(me.id, {
        username:     form.username,
        age:          Number(form.age),
        weight:       Number(form.weight),
        height:       Number(form.height),
        fitness_goal: form.fitness_goal,
        user_level:   form.user_level,
      })
      setSuccess('Profile saved successfully')
      setEditing(false)
      const updated = await userDetailDashboard(me.id)
      setProfile(updated)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Loading...
    </div>
  )

  if (!profile) return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Profile not found
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium text-gray-800">Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your personal information</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setError(''); setSuccess('') }}
              className="text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-medium text-indigo-600">
          {profile.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="text-base font-medium text-gray-800">{profile.username}</div>
          <div className="text-sm text-gray-400">{profile.email}</div>
        </div>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* BMR Card */}
      <div className="bg-indigo-50 rounded-2xl p-5 mb-6">
        <div className="text-xs text-indigo-400 mb-1">Your BMR</div>
        <div className="text-3xl font-medium text-indigo-600">
          {profile.bmr ?? '-'} <span className="text-base font-normal">kcal/day</span>
        </div>
        <div className="text-xs text-indigo-300 mt-1">
          Calculated from weight, height, age and sex
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
          Account Info
        </div>
        <div className="space-y-4">

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Username</label>
            {editing ? (
              <input
                value={form.username}
                onChange={e => set('username', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
              />
            ) : (
              <div className="text-sm text-gray-800">{profile.username}</div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <div className="text-sm text-gray-400">{profile.email}</div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Sex</label>
            <div className="text-sm text-gray-800 capitalize">{profile.sex}</div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Member Since</label>
            <div className="text-sm text-gray-800">
              {new Date(profile.member_since).toLocaleDateString('en-GB')}
            </div>
          </div>

        </div>
      </div>

      {/* Body Info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
          Body Info
        </div>
        <div className="grid grid-cols-3 gap-4">

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Age</label>
            {editing ? (
              <input
                type="number"
                value={form.age}
                onChange={e => set('age', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
              />
            ) : (
              <div className="text-sm text-gray-800">{profile.age} yrs</div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Weight</label>
            {editing ? (
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
              />
            ) : (
              <div className="text-sm text-gray-800">{profile.weight} kg</div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Height</label>
            {editing ? (
              <input
                type="number"
                step="0.1"
                value={form.height}
                onChange={e => set('height', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
              />
            ) : (
              <div className="text-sm text-gray-800">{profile.height} cm</div>
            )}
          </div>

        </div>
      </div>

      {/* Goals */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
          Goals & Level
        </div>
        <div className="space-y-4">

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fitness Goal</label>
            {editing ? (
              <select
                value={form.fitness_goal}
                onChange={e => set('fitness_goal', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="flexibility">Flexibility</option>
                <option value="general_health">General Health</option>
              </select>
            ) : (
              <div className="text-sm text-gray-800">
                {fitnessGoalLabel[profile.fitness_goal] ?? profile.fitness_goal}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Level</label>
            {editing ? (
              <select
                value={form.user_level}
                onChange={e => set('user_level', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
            ) : (
              <div className="text-sm text-gray-800">
                {userLevelLabel[profile.user_level] ?? profile.user_level}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}