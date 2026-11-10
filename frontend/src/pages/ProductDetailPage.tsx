import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productsApi } from '../api'
import { ApiError } from '../api/client'
import type { ProductResponse } from '../types/api'
import { money } from '../utils/format'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { add } = useCart(); const { user } = useAuth(); const navigate = useNavigate(); const { error } = useToast()
  useEffect(() => {
    let active = true
    productsApi.get(id).then(p => { if (active) setProduct(p) }).catch(e => {
      if (!active) return
      if (e instanceof ApiError && e.status === 404) setNotFound(true)
      else error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, error])
  if (loading) return <main className="page-shell loading-inline">LOADING OBJECT.....</main>
  if (notFound || !product) return <main className="page-shell empty-state"><h1>OBJECT NOT FOUND.</h1><Link to="/" className="button button-dark">BACK TO SHOP →</Link></main>
  return <main className="page-shell"><p className="eyebrow breadcrumb"><Link to="/">SHOP</Link> / OBJECT DETAIL</p><section className="detail-layout">
    <div className="detail-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name}/> : <span>CANARY / OBJECT</span>}</div>
    <div className="detail-copy"><p className="eyebrow">{product.category || 'GENERAL'} / CS—OBJECT</p><h1>{product.name}</h1><strong className="detail-price">{money(product.price)}</strong><p className="detail-description">{product.description || 'A considered everyday essential.'}</p><p className="stock-note">{product.available ? `${product.stockQuantity} AVAILABLE` : 'CURRENTLY UNAVAILABLE'}</p>{product.available ? <button className="button button-dark" onClick={() => user ? void add(product.id) : navigate('/login', { state: { from: `/products/${id}` } })}>ADD TO CART →</button> : <button className="button button-muted" disabled>OUT OF STOCK</button>}</div>
  </section></main>
}
