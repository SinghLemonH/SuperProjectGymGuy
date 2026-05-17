import { NavLink, useNavigate } from 'react-router-dom'
import { getUser } from '../../api/auth'
import { apiLogout } from '../../api/auth.api'

const navItems = [
  { to: '/dashboard',   icon: '▦',  label: 'Home' },
  { to: '/exercises',   icon: '◎',  label: 'Exercises' },
  { to: '/plans',       icon: '☰',  label: 'My Plans' },
  { to: '/sessions',    icon: '⊞',  label: 'Sessions' },
  { to: '/leaderboard', icon: '★',  label: 'Leaderboard' },
  { to: '/reports',     icon: '↗',  label: 'Reports' },
]

export default function Sidebar() {
  const user = getUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await apiLogout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="w-48 h-screen bg-white border-r border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="text-base font-medium text-emerald-600">GymGuy</div>
        <div className="text-xs text-gray-400 mt-0.5">fitness tracker</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-5 py-2.5 text-sm border-l-2 transition-colors ` +
              (isActive
                ? 'text-emerald-600 bg-emerald-50 border-emerald-500 font-medium'
                : 'text-gray-500 border-transparent hover:bg-gray-50')
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="mx-3 mb-3 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">
            {user?.username?.slice(0, 2).toUpperCase() ?? 'U'}
          </div>
          <div>
            <div className="text-xs font-medium text-gray-800">{user?.username ?? 'user'}</div>
            <div className="text-xs text-gray-400">{user?.fitness_goal ?? ''}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs text-gray-400 hover:text-red-500 text-left transition-colors"
        >
          logout
        </button>
      </div>

    </div>
  )
}