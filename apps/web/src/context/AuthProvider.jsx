import { useEffect, useState } from 'react'

import { endpoints } from '@/lib/api/endpoints'
import { ApiError } from '@/lib/api/envelope'

import { AuthContext } from './auth-context'

const AuthProvider = ({ children }) => {
  const [authStatus, setAuthStatus] = useState('checking')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    endpoints.authMe
      .request({ signal: controller.signal })
      .then((response) => {
        setUser(response.data.user)
        setAuthStatus('authenticated')
      })
      .catch((error) => {
        if (
          error instanceof ApiError &&
          error.errorCode === 'REQUEST_CANCELLED'
        ) {
          return
        }

        setUser(null)
        setAuthStatus(
          error instanceof ApiError && error.status === 401
            ? 'anonymous'
            : 'unavailable',
        )
      })

    return () => controller.abort()
  }, [])

  const login = (authenticatedUser) => {
    setUser(authenticatedUser)
    setAuthStatus('authenticated')
  }

  const clearSession = () => {
    setUser(null)
    setAuthStatus('anonymous')
  }

  const logout = async () => {
    try {
      await endpoints.logout.request()
      clearSession()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession()
        return
      }

      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        isAuthenticated: authStatus === 'authenticated',
        isAuthLoading: authStatus === 'checking',
        user,
        login,
        logout,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
