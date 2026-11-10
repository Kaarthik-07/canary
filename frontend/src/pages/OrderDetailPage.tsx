import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ordersApi } from '../api'
import { ApiError } from '../api/client'
import type { OrderResponse } from '../types/api'
import { dateTime, money, shortId } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function OrderDetailPage() {
  const { id = '' } = useParams(); const { session } = useAuth(); const { error } = useToast()
  const [order, setOrder] = useState<OrderResponse | null>(null); const [loading, setLoading] = useState(true); const [missing, setMissing] = useState(false)
  useEffect(() => {
    let active = true
    if (!session) return
    ordersApi.get(session.token, id).then(v => { if (active) setOrder(v) }).catch(e => {
      if (!active) return
      if (e instanceof ApiError && e.status === 404) setMissing(true)
      else error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session, id, error])
  if (loading) return <main className="page-shell loading-inline">LOADING ORDER.....</main>
  if (missing || !order) return <main className="page-shell empty-state"><h1>ORDER NOT FOUND.</h1><Link to="/orders" className="button button-dark">BACK TO ORDERS →</Link></main>
  return <main className="page-shell"><p className="eyebrow breadcrumb"><Link to="/orders">ORDERS</Link> / {shortId(order.id)}</p><div className="page-title-row"><div><p className="eyebrow">ORDER CONFIRMATION / {dateTime(order.updatedAt)}</p><h1>IT'S <em>YOURS.</em></h1></div><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></div>
    <section className="order-detail-card">{order.items.map(item => <div className="checkout-line" key={item.itemId}><span>{item.productName} <small>× {item.quantity}</small></span><strong>{money(item.subtotal)}</strong></div>)}<div className="summary-total"><span>TOTAL PAID</span><strong>{money(order.totalAmount)}</strong></div></section><Link to="/" className="button button-dark">BACK TO SHOP →</Link>
  </main>
}
