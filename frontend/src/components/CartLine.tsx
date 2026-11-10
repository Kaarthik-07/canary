import { Minus, Plus, X } from 'lucide-react'
import type { OrderItemResponse } from '../types/api'
import { money } from '../utils/format'
import { useCart } from '../context/CartContext'

export function CartLine({ item }: { item: OrderItemResponse }) {
  const { update, remove, busyItemId } = useCart()
  const busy = busyItemId === item.itemId
  return <article className={`cart-line ${busy ? 'is-busy' : ''}`}>
    <div className="cart-thumb">{item.imageUrl ? <img src={item.imageUrl} alt={item.productName}/> : <span>CS</span>}</div>
    <div className="cart-description"><span className="eyebrow">CANARY OBJECT</span><h3>{item.productName}</h3><p>{money(item.unitPrice)} / UNIT</p></div>
    <div className="quantity-control">
      <button aria-label="Decrease quantity" disabled={busy || item.quantity <= 1} onClick={() => void update(item.itemId, item.quantity - 1)}><Minus size={14}/></button>
      <span>{item.quantity}</span>
      <button aria-label="Increase quantity" disabled={busy || item.quantity >= 100} onClick={() => void update(item.itemId, item.quantity + 1)}><Plus size={14}/></button>
    </div>
    <strong className="line-total">{money(item.subtotal)}</strong>
    <button className="remove-button" aria-label={`Remove ${item.productName}`} disabled={busy} onClick={() => void remove(item.itemId)}><X size={17}/></button>
  </article>
}
