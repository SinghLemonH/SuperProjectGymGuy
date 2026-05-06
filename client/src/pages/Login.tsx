import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginApi } from '../api/auth'
import { Button } from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const { login } = useAuth()
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
      const data = await loginApi({ email, password })
      login(data.access_token, data.refresh_token, data.user)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'เข้าสู่ระบบไม่สำเร็จ'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900">
            Gym<span className="text-[#534AB7]">GUY</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">เข้าสู่ระบบเพื่อติดตามการออกกำลังกาย</p>
        </div>

        {/* card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="อีเมล"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="รหัสผ่าน"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              error={error}
            />

            <Button type="submit" loading={loading} className="w-full mt-1">
              เข้าสู่ระบบ
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-[#534AB7] hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}
