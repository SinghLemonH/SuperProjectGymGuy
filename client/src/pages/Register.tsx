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
      setError(err?.message ?? 'สมัครสมาชิกไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8">

        {/* Logo */}
        <div className="mb-8">
          <div className="text-xl font-medium text-emerald-600">GymGuy</div>
          <div className="text-sm text-gray-400 mt-1">สร้างบัญชีใหม่</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ข้อมูลบัญชี */}
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            ข้อมูลบัญชี
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">ชื่อผู้ใช้</label>
            <input
              type="text"
              value={form.username}
              onChange={e => set('username', e.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">อีเมล</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="กรอกอีเมลของคุณ"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">รหัสผ่าน</label>
            <input
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              required
              minLength={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* ข้อมูลร่างกาย */}
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-2">
            ข้อมูลร่างกาย
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">อายุ</label>
              <input
                type="number"
                value={form.age}
                onChange={e => set('age', e.target.value)}
                placeholder="ปี"
                required
                min={1}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">เพศ</label>
              <select
                value={form.sex}
                onChange={e => set('sex', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              >
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">น้ำหนัก (kg)</label>
              <input
                type="number"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                placeholder="เช่น 65"
                required
                min={1}
                step="0.1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ส่วนสูง (cm)</label>
              <input
                type="number"
                value={form.height}
                onChange={e => set('height', e.target.value)}
                placeholder="เช่น 175"
                required
                min={1}
                step="0.1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {/* เป้าหมาย */}
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-2">
            เป้าหมาย
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">เป้าหมายการออกกำลังกาย</label>
            <select
              value={form.fitness_goal}
              onChange={e => set('fitness_goal', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="weight_loss">ลดน้ำหนัก</option>
              <option value="muscle_gain">เพิ่มกล้ามเนื้อ</option>
              <option value="strength">เพิ่มความแข็งแรง</option>
              <option value="endurance">เพิ่มความทนทาน</option>
              <option value="flexibility">เพิ่มความยืดหยุ่น</option>
              <option value="general_health">สุขภาพโดยรวม</option>
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
            className="w-full bg-emerald-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>

        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-emerald-600 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>

      </div>
    </div>
  )
}