import { Navigate, Outlet } from 'react-router-dom'
import { isLoggedIn } from '../../api/auth'

export default function ProtectedRoute() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return <Outlet />
}