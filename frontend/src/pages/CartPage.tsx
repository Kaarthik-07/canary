import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { CartLine } from '../components/CartLine'
import { useCart } from '../context/CartContext'
import { money } from '../utils/format'

export function CartPage() {
  const { cart, loading } = useCart()
  const navigate = useNavigate()
  if (loading) return <main className="page-shell loading-inline">LOADING YOUR CART.....</main>
  return <main className="page-shell">
    <div className="page-title-row"><div><p className="eyebrow">YOUR SELECTION / 01</p><h1>THE <em>CART.</em></h1></div><span className="eyebrow">{cart.totalQuantity} ITEMS</span></div>
    {!cart.items.length ? <div className="empty-state"><ShoppingBag size={34}/><h2>NOTHING IN HERE. YET.</h2><p>Your next favourite thing is waiting.</p><Link to="/" className="button button-dark">EXPLORE THE COLLECTION →</Link></div> : <div className="cart-layout">
      <section className="cart-items">{cart.items.map(item => <CartLine key={item.itemId} item={item}/>)}</section>
      <aside className="summary-card"><p className="eyebrow">ORDER SUMMARY</p><div className="summary-row"><span>ITEMS</span><span>{cart.totalQuantity}</span></div><div className="summary-total"><span>TOTAL</span><strong>{money(cart.totalAmount)}</strong></div><p className="summary-note">Final pricing is confirmed by the server at checkout.</p><button className="button button-dark full" onClick={() => navigate('/checkout')}>CONTINUE TO CHECKOUT <ArrowRight size={16}/></button><Link to="/" className="continue-link">← CONTINUE SHOPPING</Link></aside>
    </div>}
  </main>
}
