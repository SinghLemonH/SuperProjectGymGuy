import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register as registerApi, type RegisterPayload } from '../api/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const GOALS = [
  { value: 'weight_loss',    label: 'ลดน้ำหนัก' },
  { value: 'muscle_gain',    label: 'เพิ่มกล้ามเนื้อ' },
  { value: 'strength',       label: 'เพิ่มความแข็งแรง' },
  { value: 'endurance',      label: 'ความอดทน' },
  { value: 'flexibility',    label: 'ความยืดหยุ่น' },
  { value: 'general_health', label: 'สุขภาพโดยรวม' },
]

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '', email: '', password: '',
    gender: 'male' as 'male' | 'female',
    fitness_goal: 'general_health' as RegisterPayload['fitness_goal'],
    age: '', weight: '', height: '',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await registerApi({
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
      })
      login(data.access_token, data.refresh_token, data.user)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'สมัครสมาชิกไม่สำเร็จ'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900">
            Gym<span className="text-[#534AB7]">GUY</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">สร้างบัญชีใหม่</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="grid grid-cols-2 gap-3">
              <Input label="ชื่อผู้ใช้" placeholder="username" value={form.username} onChange={set('username')} required />
              <Input label="อีเมล" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required />
            </div>

            <Input label="รหัสผ่าน (อย่างน้อย 8 ตัว)" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />

            <div className="grid grid-cols-3 gap-3">
              <Input label="อายุ" type="number" placeholder="22" min={1} value={form.age} onChange={set('age')} required />
              <Input label="น้ำหนัก (kg)" type="number" placeholder="65" min={1} step="0.1" value={form.weight} onChange={set('weight')} required />
              <Input label="ส่วนสูง (cm)" type="number" placeholder="170" min={1} step="0.1" value={form.height} onChange={set('height')} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">เพศ</label>
                <select
                  value={form.gender}
                  onChange={set('gender')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] hover:border-gray-300 transition-all"
                >
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">เป้าหมาย</label>
                <select
                  value={form.fitness_goal}
                  onChange={set('fitness_goal')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] hover:border-gray-300 transition-all"
                >
                  {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-xs text-[#A32D2D] bg-[#FCEBEB] px-3 py-2 rounded-lg">{error}</p>}

            <Button type="submit" loading={loading} className="w-full mt-1">
              สมัครสมาชิก
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          มีบัญชีแล้ว?{' '}
          <Link to="/login" className="text-[#534AB7] hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}
