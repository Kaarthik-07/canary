import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, Package, UserRound, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Canary Shop home">
        CANARY<span>®</span>
      </Link>
      <nav className="header-nav">
        <Link to="/" className="nav-link">
          SHOP
        </Link>
        <Link to="/offers" className="nav-link">
          <Tag size={15} /> OFFERS
        </Link>
        {user ? (
          <>
            <Link to="/orders" className="nav-link nav-orders">
              <Package size={15} /> ORDERS
            </Link>
            <button
              className="user-menu"
              onClick={() => {
                logout();
                navigate('/');
              }}
              title="Log out"
            >
              <UserRound size={15} />
              <span>{user.name}</span>
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-link">
            LOGIN
          </Link>
        )}
        <Link
          to="/cart"
          className="cart-link"
          aria-label={`Cart, ${cart.totalQuantity} items`}
        >
          <ShoppingBag size={18} />
          <span>CART</span>
          <b>{cart.totalQuantity}</b>
        </Link>
      </nav>
    </header>
  );
}
