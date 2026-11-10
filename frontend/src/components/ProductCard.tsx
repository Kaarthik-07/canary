import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ProductResponse } from '../types/api'
import { money } from '../utils/format'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function ProductCard({ product }: { product: ProductResponse }) {
  const { add } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  return <article className="product-card">
    <Link to={`/products/${product.id}`} className="product-image">
      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }}/> : <span className="image-placeholder">CS / OBJECT {product.id.slice(0, 4).toUpperCase()}</span>}
      <span className="image-arrow"><ArrowUpRight size={18}/></span>
    </Link>
    <div className="product-info">
      <div className="product-meta"><span>{product.category || 'GENERAL'}</span>{product.stockQuantity > 0 && product.stockQuantity <= 5 && <span className="low-stock">ONLY {product.stockQuantity} LEFT</span>}</div>
      <Link to={`/products/${product.id}`} className="product-name">{product.name}</Link>
      <div className="product-bottom"><strong>{money(product.price)}</strong>
        {product.available
          ? <button className="text-button" onClick={() => user ? void add(product.id) : navigate('/login', { state: { from: '/' } })}>ADD TO CART +</button>
          : <span className="out-stock">OUT OF STOCK</span>}
      </div>
    </div>
  </article>
}
