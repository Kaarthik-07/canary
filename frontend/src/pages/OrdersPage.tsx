import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '../api'
import { ApiError } from '../api/client'
import type { OrderSummaryResponse, PageResponse } from '../types/api'
import { dateTime, money, shortId } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function OrdersPage() {
  const { session } = useAuth(); const { error } = useToast()
  const [data, setData] = useState<PageResponse<OrderSummaryResponse> | null>(null)
  const [page, setPage] = useState(0); const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    if (!session) return
    setLoading(true)
    ordersApi.list(session.token, page, 10).then(v => { if (active) setData(v) })
      .catch(e => { if (active) error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session, page, error])
  return <main className="page-shell"><div className="page-title-row"><div><p className="eyebrow">YOUR PURCHASE HISTORY</p><h1>THE <em>ORDERS.</em></h1></div></div>
    {loading ? <div className="loading-inline">LOADING ORDERS.....</div> : data?.content.length ? <><div className="orders-list">{data.content.map(order => <Link to={`/orders/${order.id}`} className="order-row" key={order.id}><div><span className="eyebrow">ORDER / {shortId(order.id)}</span><strong>{dateTime(order.updatedAt)}</strong></div><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span><strong>{money(order.totalAmount)}</strong><span>↗</span></Link>)}</div><div className="pagination"><span>PAGE {page + 1} / {Math.max(data.totalPages, 1)}</span><div><button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← PREVIOUS</button><button disabled={data.last} onClick={() => setPage(p => p + 1)}>NEXT →</button></div></div></> : <div className="empty-state"><h2>NO ORDERS. FOR NOW.</h2><Link to="/" className="button button-dark">FIND SOMETHING →</Link></div>}
  </main>
}
