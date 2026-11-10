import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cartApi } from '../api'
import { ApiError } from '../api/client'
import type { CartResponse } from '../types/api'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const EMPTY_CART: CartResponse = { cartId: null, items: [], totalQuantity: 0, totalAmount: 0 }
type CartContextValue = {
  cart: CartResponse
  loading: boolean
  busyItemId: string | null
  refresh: () => Promise<void>
  add: (productId: string, quantity?: number) => Promise<boolean>
  update: (itemId: string, quantity: number) => Promise<boolean>
  remove: (itemId: string) => Promise<boolean>
}
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const { error, success } = useToast()
  const [cart, setCart] = useState<CartResponse>(EMPTY_CART)
  const [loading, setLoading] = useState(false)
  const [busyItemId, setBusyItemId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!session) { setCart(EMPTY_CART); return }
    setLoading(true)
    try { setCart(await cartApi.get(session.token)) }
    catch (e) { error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG') }
    finally { setLoading(false) }
  }, [session, error])

  useEffect(() => { void refresh() }, [refresh])

  const add = useCallback(async (productId: string, quantity = 1) => {
    if (!session) return false
    try {
      setCart(await cartApi.add(session.token, { productId, quantity }))
      success('ADDED TO CART')
      return true
    } catch (e) {
      error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG')
      return false
    }
  }, [session, error, success])

  const update = useCallback(async (itemId: string, quantity: number) => {
    if (!session) return false
    setBusyItemId(itemId)
    try {
      setCart(await cartApi.update(session.token, itemId, { quantity }))
      return true
    } catch (e) {
      error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG')
      return false
    } finally { setBusyItemId(null) }
  }, [session, error])

  const remove = useCallback(async (itemId: string) => {
    if (!session) return false
    setBusyItemId(itemId)
    try {
      setCart(await cartApi.remove(session.token, itemId))
      success('ITEM REMOVED')
      return true
    } catch (e) {
      error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG')
      return false
    } finally { setBusyItemId(null) }
  }, [session, error, success])

  const value = useMemo(() => ({ cart, loading, busyItemId, refresh, add, update, remove }), [cart, loading, busyItemId, refresh, add, update, remove])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
