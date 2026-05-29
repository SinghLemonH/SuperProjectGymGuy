import { NavLink, useNavigate } from 'react-router-dom'
import { getUser } from '../../api/auth'
import { apiLogout } from '../../api/auth.api'

const navItems = [
  { to: '/dashboard',     icon: '▦', label: 'Home' },
  { to: '/exercises',     icon: '◎', label: 'Exercises' },
  { to: '/workout-plans', icon: '☰', label: 'My Plans' }, // ← แก้ /plans → /workout-plans
  { to: '/sessions',      icon: '⊞', label: 'Sessions' },
  { to: '/leaderboard',   icon: '★', label: 'Leaderboard' },
  { to: '/reports',       icon: '↗', label: 'Reports' },
]

export default function Sidebar() {
  const user = getUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await apiLogout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="w-52 h-screen bg-white border-r border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="text-lg font-bold">
          <span className="text-gray-900">Gym</span>
          <span className="text-indigo-500">GUY</span>
        </div>
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
                ? 'text-indigo-500 bg-indigo-50 border-indigo-500 font-medium'
                : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700')
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User card — กดไป Profile */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `mx-3 mb-3 p-3 rounded-xl block transition-colors ` +
          (isActive
            ? 'bg-indigo-50 border border-indigo-100'
            : 'bg-gray-50 hover:bg-gray-100')
        }
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
            {user?.username?.slice(0, 2).toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-gray-800 truncate">
              {user?.username ?? 'user'}
            </div>
            <div className="text-xs text-gray-400 truncate capitalize">
              {user?.fitness_goal?.replace('_', ' ') ?? ''}
            </div>
          </div>
        </div>
        <button
          onClick={e => { e.preventDefault(); handleLogout() }}
          className="w-full text-xs text-gray-400 hover:text-red-500 text-left transition-colors"
        >
          logout
        </button>
      </NavLink>

    </div>
  )
}