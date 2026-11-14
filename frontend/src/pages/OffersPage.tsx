import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function OffersPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="page-shell">
        <div className="loading-inline">LOADING...</div>
      </main>
    );
  }

  const isCanary = user?.cohort === 'CANARY' && user.featureEnabled;

  if (!isCanary) {
    return (
      <main className="page-shell">
        <section className="catalog-section">
          <span className="eyebrow">CANARY® / NEW FEATURE</span>
          <div className="empty-state">
            <h1>COMING SOON.</h1>
            <p>
              Exclusive offers are currently under development. Stay tuned for
              something special.
            </p>
            <Link to="/" className="button button-dark">
              BACK TO SHOP →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="catalog-section">
        <div className="section-heading">
          <div>
            <h2>EXCLUSIVE OFFERS.</h2>
            <p>Special deals, curated just for you.</p>
          </div>
          <span className="eyebrow">CANARY EDITION / 2026</span>
        </div>

        <div className="empty-state">
          <h3>NEW SEASON OFFERS ARE LIVE.</h3>
          <p>
            You're part of our early-access release. Explore the new experience.
          </p>
          <Link to="/" className="button button-dark">
            EXPLORE COLLECTION →
          </Link>
        </div>
      </section>
    </main>
  );
}
