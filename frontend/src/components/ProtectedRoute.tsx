import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loading } from './Loading'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading label="RESTORING YOUR SESSION"/>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }}/>
  return children
}
