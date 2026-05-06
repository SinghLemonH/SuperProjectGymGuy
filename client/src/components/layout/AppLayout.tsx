import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const PAGE_TITLE: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/leaderboard':  'Leaderboard',
  '/exercises':    'Exercise',
  '/plans':        'Workout plan',
  '/sessions':     'Session log',
  '/sessions/log': 'Log session',
  '/reports':      'Reports',
  '/profile':      'Profile',
}

export default function AppLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center px-6 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h1 className="text-[16px] font-medium text-gray-900">{PAGE_TITLE[pathname] ?? ''}</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
