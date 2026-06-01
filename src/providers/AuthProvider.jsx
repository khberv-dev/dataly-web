import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/services/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const qc = useQueryClient()
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    enabled: !!token,
    retry: false,
  })

  function login(accessToken) {
    localStorage.setItem('token', accessToken)
    setToken(accessToken)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    qc.clear()
  }

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored !== token) setToken(stored)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
