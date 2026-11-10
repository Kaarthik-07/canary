import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { Toaster, toast } from 'sonner'

type ToastApi = { success: (message: string) => void; error: (message: string) => void; info: (message: string) => void }
const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const success = useCallback((message: string) => toast.success(message), [])
  const error = useCallback((message: string) => toast.error(message), [])
  const info = useCallback((message: string) => toast(message), [])
  const value = useMemo(() => ({ success, error, info }), [success, error, info])
  return <ToastContext.Provider value={value}>
    {children}
    <Toaster position="top-left" duration={4000} richColors={false} toastOptions={{ className: 'mono-toast' }} />
  </ToastContext.Provider>
}
export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value
}
