import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout      from './components/layout/AppLayout'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Profile        from './pages/Profile'
import Dashboard      from './pages/Dashboard'
import Leaderboard    from './pages/LeaderBoard'

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
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route path="/profile"           element={<Profile />} />
            <Route path="/leaderboard"       element={<Leaderboard />} />

            <Route path="/exercises"         element={<Exercises />} />
            <Route path="/exercises/:id"     element={<ExerciseDetail />} />

            {/* ✅ create ต้องมาก่อน /:id ไม่งั้น /create จะถูก match เป็น id="create" */}
            <Route path="/workout-plans"          element={<WorkoutPlans />} />
            
            <Route path="/workout-plans/:id"      element={<WorkoutPlanDetail />} />

            <Route path="/sessions"          element={<Soon name="Sessions" />} />
            <Route path="/reports"           element={<Soon name="Reports" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}