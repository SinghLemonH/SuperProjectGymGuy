import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout      from './components/layout/AppLayout'
import Login          from './pages/Login'
import Register       from './pages/Register'

const Soon = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-screen text-gray-400">
    {name} — coming soon
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"   element={<Soon name="Dashboard" />} />
            <Route path="/profile"     element={<Soon name="Profile" />} />
            <Route path="/exercises"   element={<Soon name="Exercises" />} />
            <Route path="/plans"       element={<Soon name="Plans" />} />
            <Route path="/sessions"    element={<Soon name="Sessions" />} />
            <Route path="/leaderboard" element={<Soon name="Leaderboard" />} />
            <Route path="/reports"     element={<Soon name="Reports" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}