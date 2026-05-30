import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute    from './components/layout/ProtectedRoute'
import AppLayout         from './components/layout/AppLayout'

// Auth
import Login             from './pages/Login'
import Register          from './pages/Register'

// Wichitchai
import Profile           from './pages/Profile'

// Kittipich
import Dashboard         from './pages/Dashboard'
import Leaderboard       from './pages/LeaderBoard'
import Report            from './pages/report'

// Wathit
import Exercises         from './pages/Exercises'
import ExerciseDetail    from './pages/ExerciseDetail'
import WorkoutPlans      from './pages/WorkoutPlans'
import WorkoutPlanDetail from './pages/WorkoutPlanDetail'

// Aphichaya
import WorkoutSessions   from './pages/WorkoutSessions'
import SessionDetail     from './pages/SessionDetail'
import LogSession        from './pages/LogSession'

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

            {/* Kittipich */}
            <Route path="/dashboard"          element={<Dashboard />} />
            <Route path="/leaderboard"        element={<Leaderboard />} />
            <Route path="/reports"            element={<Report />} />

            {/* Wichitchai */}
            <Route path="/profile"            element={<Profile />} />

            {/* Wathit */}
            <Route path="/exercises"          element={<Exercises />} />
            <Route path="/exercises/:id"      element={<ExerciseDetail />} />
            <Route path="/workout-plans"              element={<WorkoutPlans />} />
            <Route path="/workout-plans/:id"    element={<WorkoutPlanDetail />} />

            {/* Aphichaya */}
            <Route path="/sessions"           element={<WorkoutSessions />} />
            <Route path="/sessions/log"       element={<LogSession />} /> 
            <Route path="/sessions/:id"       element={<SessionDetail />} />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}