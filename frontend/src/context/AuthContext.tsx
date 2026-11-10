import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api'
import type { AuthResponse, LoginRequest, RegisterRequest, Session, UserResponse } from '../types/api'
import { useToast } from './ToastContext'

const STORAGE_KEY = 'canary-shop-session'
type AuthContextValue = {
  session: Session | null
  user: UserResponse | null
  loading: boolean
  login: (body: LoginRequest) => Promise<void>
  register: (body: RegisterRequest) => Promise<UserResponse>
  logout: () => void
}
const AuthContext = createContext<AuthContextValue | null>(null)

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed.token || !parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { success, error } = useToast()

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  useEffect(() => {
    let active = true
    const stored = readSession()
    if (!stored) { setLoading(false); return }
    authApi.me(stored.token)
      .then(user => {
        if (!active) return
        const restored = { ...stored, user }
        setSession(restored)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restored))
      })
      .catch(() => {
        if (!active) return
        clearSession()
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [clearSession])

  const login = useCallback(async (body: LoginRequest) => {
    const result: AuthResponse = await authApi.login(body)
    const next: Session = { token: result.token, user: result.user, expiresAt: Date.now() + result.expiresInSeconds * 1000 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSession(next)
    success('WELCOME BACK')
  }, [success])

  const register = useCallback(async (body: RegisterRequest) => {
    const user = await authApi.register(body)
    success(`${user.name.toUpperCase()} SUCCESSFULLY REGISTERED`)
    return user
  }, [success])

  const logout = useCallback(() => {
    clearSession()
    success('SIGNED OUT')
  }, [clearSession, success])

  useEffect(() => {
    const onExpired = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail
      clearSession()
      error(detail?.message || 'SESSION EXPIRED')
    }
    window.addEventListener('canary:session-expired', onExpired)
    return () => window.removeEventListener('canary:session-expired', onExpired)
  }, [clearSession, error])

  const value = useMemo(() => ({ session, user: session?.user ?? null, loading, login, register, logout }), [session, loading, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
