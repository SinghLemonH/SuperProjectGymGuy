import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRegister } from '../api/auth.api'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    username:     '',
    email:        '',
    password:     '',
    sex:          'male',
    age:          '',
    weight:       '',
    height:       '',
    fitness_goal: 'general_health',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiRegister({
        username:     form.username,
        email:        form.email,
        password:     form.password,
        sex:          form.sex,
        age:          Number(form.age),
        weight:       Number(form.weight),
        height:       Number(form.height),
        fitness_goal: form.fitness_goal,
      })
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left — brand */}
      <div className="hidden lg:flex w-1/2 bg-indigo-500 flex-col items-center justify-center">
        <div className="text-5xl font-bold text-white mb-4">
          Gym<span className="text-indigo-200">GUY</span>
        </div>
        <div className="text-indigo-200 text-lg">Track your fitness journey</div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-gray-50 px-8 py-10">
        <div className="w-full max-w-md">

          <div className="mb-8 text-center lg:text-left">
            <div className="text-3xl font-bold">
              <span className="text-gray-900">Gym</span>
              <span className="text-indigo-500">GUY</span>
            </div>
            <div className="text-sm text-gray-400 mt-2">Create your account</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Account */}
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Account
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                  placeholder="your username"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="min 8 characters"
                  required
                  minLength={8}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              {/* Body */}
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-2">
                Body Info
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={e => set('age', e.target.value)}
                    placeholder="yrs"
                    required
                    min={1}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Sex</label>
                  <select
                    value={form.sex}
                    onChange={e => set('sex', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Weight (kg)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={e => set('weight', e.target.value)}
                    placeholder="e.g. 65"
                    required
                    min={1}
                    step="0.1"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Height (cm)</label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={e => set('height', e.target.value)}
                    placeholder="e.g. 175"
                    required
                    min={1}
                    step="0.1"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>
              </div>

              {/* Goal */}
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-2">
                Goal
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fitness Goal</label>
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
              </div>

              {error && (
                <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500 text-white text-sm font-medium py-3 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-500 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}