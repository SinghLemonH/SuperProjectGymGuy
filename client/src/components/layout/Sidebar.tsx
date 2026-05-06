import { NavLink, useNavigate } from 'react-router-dom'
import { getUser, getToken, clearSession } from '../../api/auth'

const NAV = [
  { section: 'หลัก', items: [
    { to: '/dashboard',   label: 'Dashboard' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ]},
  { section: 'ออกกำลังกาย', items: [
    { to: '/exercises', label: 'Exercise' },
    { to: '/plans',     label: 'Workout plan' },
    { to: '/sessions',  label: 'Session log' },
  ]},
  { section: 'ข้อมูล', items: [
    { to: '/reports', label: 'Reports' },
    { to: '/profile', label: 'Profile' },
  ]},
]

export default function Sidebar() {
  const user = getUser()
  const navigate = useNavigate()
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'GG'

  async function handleLogout() {
    const token = getToken()
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch { /* ignore */ }
    }
    clearSession()
    navigate('/login')
  }

  return (
    <aside className="w-[200px] flex-shrink-0 flex flex-col border-r border-gray-100 bg-gray-50 min-h-screen">
      {/* logo */}
      <div className="px-4 py-[18px] border-b border-gray-100">
        <span className="text-[15px] font-medium text-gray-900">
          Gym<span className="text-[#534AB7]">GUY</span>
        </span>
      </div>

      {/* nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV.map(group => (
          <div key={group.section}>
            <p className="px-4 pt-4 pb-1 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
              {group.section}
            </p>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => [
                  'flex items-center gap-2.5 mx-1.5 px-3 py-2 rounded-md text-[13px] transition-colors duration-100',
                  isActive
                    ? 'bg-white text-[#534AB7] font-medium border border-gray-100 shadow-sm'
                    : 'text-gray-500 hover:bg-white hover:text-gray-900',
                ].join(' ')}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* footer */}
      <div className="p-3 border-t border-gray-100 flex flex-col gap-1">
        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 p-2 rounded-md hover:bg-white transition-colors"
        >
          <div className="w-[30px] h-[30px] rounded-full bg-[#EEEDFE] flex items-center justify-center text-[11px] font-medium text-[#3C3489] flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-gray-900 truncate">{user?.username ?? '—'}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.fitness_goal?.replace(/_/g, ' ') ?? ''}</p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full text-left px-2 py-1.5 text-[12px] text-gray-400 hover:text-red-500 rounded-md hover:bg-white transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
