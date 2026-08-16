import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, userApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await userApi.getProfile()
      setUser(data)
    } catch {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const refreshUser = async () => {
    const { data } = await userApi.getProfile()
    setUser(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
