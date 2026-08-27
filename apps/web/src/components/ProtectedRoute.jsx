import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/context/useAuth'

const ProtectedRoute = () => {
  const { authStatus, isAuthenticated, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return (
      <main
        role="status"
        className="flex min-h-screen items-center justify-center bg-white text-[#1E293B]"
      >
        <Loader2 className="size-7 animate-spin" aria-hidden="true" />
        <span className="sr-only">Checking your session...</span>
      </main>
    )
  }

  if (authStatus === 'unavailable') {
    return <Navigate to="/sign-in-unavailable" replace />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
