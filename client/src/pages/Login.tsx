import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiLogin } from '../api/auth.api'
// import Button from '../components/ui/Button'
// import Input from '../components/ui/Input'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiLogin(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Sign in failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ซ้าย — brand */}
      <div className="hidden lg:flex w-1/2 bg-indigo-500 flex-col items-center justify-center">
        <div className="text-5xl font-bold text-white mb-4">
          Gym<span className="text-indigo-200">GUY</span>
        </div>
        <div className="text-indigo-200 text-lg">Track your workouts</div>
      </div>

      {/* ขวา — form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-gray-50 px-8">
        <div className="w-full max-w-md">

          <div className="mb-10 text-center lg:text-left">
            <div className="text-3xl font-bold">
              <span className="text-gray-900">Gym</span>
              <span className="text-indigo-500">GUY</span>
            </div>
            <div className="text-sm text-gray-400 mt-2">Login For Following your exercises</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-colors"
                />
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
                {loading ? 'Loging...' : 'Login'}
              </button>

            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-500 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}