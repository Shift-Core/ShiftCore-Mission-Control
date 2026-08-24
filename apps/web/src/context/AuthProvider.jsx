import { useState } from 'react'

import { AuthContext } from './auth-context'

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const login = (authenticatedUser) => {
    setUser(authenticatedUser)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
