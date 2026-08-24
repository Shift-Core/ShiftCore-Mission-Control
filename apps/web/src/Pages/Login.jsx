import { Loader2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/context/useAuth'

import LoginForm from './LoginForm'

const ShiftCoreIcon = () => {
  return (
    <div
      className="flex size-12 items-center justify-center rounded-md bg-[#1F293B]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-7 text-white"
      >
        <rect x="4" y="4" width="7" height="7" fill="currentColor" />
        <rect x="13" y="4" width="7" height="7" fill="currentColor" />
        <rect x="4" y="13" width="7" height="7" fill="currentColor" />
        <rect x="13" y="13" width="7" height="7" fill="currentColor" />
      </svg>
    </div>
  )
}

const Login = () => {
  const { isAuthenticated, isAuthLoading } = useAuth()

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

  if (isAuthenticated) {
    return <Navigate to="/mission-control" replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8">
      <section
        aria-labelledby="login-title"
        className="
          flex
          w-full
          max-w-[420px]
          flex-col
          rounded-[4px]
          border
          border-[#C5C6CD]
          bg-white
          p-8
          shadow-sm
          sm:max-w-[420px]
        "
      >
        {/* Logo */}
        <div className="flex justify-center">
          <ShiftCoreIcon />
        </div>

        {/* Heading */}
        <div className="mt-6 text-center">
          <h1
            id="login-title"
            className="text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#091426]"
          >
            ShiftCore Mission Control
          </h1>

          <p className="mt-1 text-sm leading-5 text-[#45474C]">
            Sign in to access your dashboard.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  )
}

export default Login
