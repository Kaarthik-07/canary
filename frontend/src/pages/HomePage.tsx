import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productsApi } from '../api';
import { ApiError } from '../api/client';
import type { ProductResponse, PageResponse } from '../types/api';
import { ProductCard } from '../components/ProductCard';
import { useToast } from '../context/ToastContext';

const SORTS = [
  ['createdAt,desc', 'LATEST'],
  ['name,asc', 'NAME: A—Z'],
  ['name,desc', 'NAME: Z—A'],
  ['price,asc', 'PRICE: LOW TO HIGH'],
  ['price,desc', 'PRICE: HIGH TO LOW'],
];
export function HomePage() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('createdAt,desc');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<ProductResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const { error } = useToast();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(q.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [q]);
  useEffect(() => {
    setPage(0);
  }, [debounced, category, sort]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    productsApi
      .list({
        page,
        size: 12,
        sort,
        category: category || undefined,
        q: debounced || undefined,
      })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((e) => {
        if (active) {
          setFailed(true);
          error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, sort, category, debounced, error]);

  const categories = useMemo(
    () =>
      [
        ...new Set(
          data?.content
            .map((p) => p.category)
            .filter((v): v is string => Boolean(v)) ?? [],
        ),
      ].sort(),
    [data],
  );
  return (
    <main className="page-shell">
      <section className="catalog-section">
        <div className="section-heading">
          <div>
            <h2>
              THE COLLECTION <span>({data?.totalElements ?? '—'})</span>
            </h2>
          </div>
          <span className="eyebrow">CURATED / 2026</span>
        </div>
        <div className="filters">
          <label className="search-box">
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="SEARCH OBJECTS..."
              aria-label="Search products"
            />
            {q && <button onClick={() => setQ('')}>CLEAR</button>}
          </label>
          <label className="select-filter">
            <SlidersHorizontal size={15} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
            >
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="select-filter">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter category"
            >
              <option value="">ALL CATEGORIES</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>
        {loading ? (
          <div className="loading-inline">LOADING COLLECTION.....</div>
        ) : failed ? (
          <div className="empty-state">
            <h3>WE COULDN'T LOAD THE COLLECTION.</h3>
            <button
              className="button button-dark"
              onClick={() => setPage((p) => p)}
            >
              TRY AGAIN →
            </button>
          </div>
        ) : data?.content.length ? (
          <>
            <div className="product-grid">
              {data.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="pagination">
              <span>
                PAGE {data.page + 1} / {Math.max(data.totalPages, 1)}
              </span>
              <div>
                <button
                  disabled={page <= 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← PREVIOUS
                </button>
                <button
                  disabled={data.last}
                  onClick={() => setPage((p) => p + 1)}
                >
                  NEXT →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>NOTHING HERE. YET.</h3>
            <p>Try a different search or category.</p>
            <button
              className="button button-dark"
              onClick={() => {
                setQ('');
                setCategory('');
              }}
            >
              CLEAR FILTERS →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
