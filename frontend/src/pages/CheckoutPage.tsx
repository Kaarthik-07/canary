import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkoutApi } from '../api'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { money } from '../utils/format'

function CheckoutExisting() {
  const { cart, refresh } = useCart()
  const { session } = useAuth()
  const { error, success } = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const submitted = useRef(false)
  const placeOrder = async () => {
    if (!session || busy || submitted.current || !cart.items.length) return
    submitted.current = true
    setBusy(true)
    try {
      const order = await checkoutApi.place(session.token)
      success('ORDER PLACED')
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        error(e.message)
        await refresh()
        navigate('/orders', { replace: true })
      } else if (e instanceof ApiError && e.status === 400) {
        error(e.message)
        await refresh()
      } else {
        error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG')
      }
    } finally { submitted.current = false; setBusy(false) }
  }
  return <div className="checkout-content"><p className="eyebrow">CHECKOUT / EXISTING EXPERIENCE</p><h1>ALMOST <em>YOURS.</em></h1><p className="checkout-intro">Review your selection before placing the order.</p>
    <div className="checkout-lines">{cart.items.map(item => <div className="checkout-line" key={item.itemId}><span>{item.productName} <small>× {item.quantity}</small></span><strong>{money(item.subtotal)}</strong></div>)}</div>
    <div className="summary-total"><span>ORDER TOTAL</span><strong>{money(cart.totalAmount)}</strong></div>
    <p className="summary-note">No payment details are collected in this demo checkout. The server re-prices items and reserves stock when you place the order.</p>
    <button className="button button-dark full" disabled={busy || !cart.items.length} onClick={() => void placeOrder()}>{busy ? 'PLACING ORDER...' : 'PLACE ORDER →'}</button>
    <Link to="/cart" className="continue-link">← BACK TO CART</Link>
  </div>
}
function CheckoutNew() {
  return <div className="checkout-content"><p className="eyebrow">CHECKOUT / NEW EXPERIENCE</p><h1>A NEW WAY<br/><em>TO CHECK OUT.</em></h1><div className="placeholder-panel"><span>CANARY EXPERIMENT / NEXT ITERATION</span><p>This checkout experience is reserved for the backend-enabled feature rollout. No new API behavior is assumed here.</p></div></div>
}
export function CheckoutPage() {
  const { user } = useAuth()
  const { cart, loading } = useCart()
  const navigate = useNavigate()
  useEffect(() => { if (!loading && cart.items.length === 0) navigate('/cart', { replace: true }) }, [loading, cart.items.length, navigate])
  if (loading) return <main className="page-shell loading-inline">PREPARING CHECKOUT.....</main>
  if (!cart.items.length) return null
  return <main className="page-shell checkout-page">{user?.featureEnabled ? <CheckoutNew/> : <CheckoutExisting/>}</main>
}
