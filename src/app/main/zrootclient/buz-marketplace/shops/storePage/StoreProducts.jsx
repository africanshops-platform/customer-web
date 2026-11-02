import { Link } from "react-router-dom";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";

const ART = [
  "#ef9a5a",
  "#5aa5ef",
  "#8a8f98",
  "#2f3a4a",
  "#7c5ae0",
  "#26b08a",
  "#d1a23c",
  "#e8c547",
];

function StoreProductCard({ product, index, onAdd, adding }) {
  const hasDiscount = product?.listprice && product.listprice > product.price;
  const off = hasDiscount ? Math.round((1 - product.price / product.listprice) * 100) : 0;
  const image = product?.imageLinks?.[0]?.url;
  const tint = ART[index % ART.length];

  return (
    <article className="sp-card" data-testid="store-product-card">
      <Link to={`/marketplace/product/${product?.slug}/view`} aria-label={`View ${product?.name}`}>
        <div
          className="sp-art"
          style={image ? undefined : { background: `linear-gradient(145deg, ${tint}, ${tint}aa)` }}
        >
          {hasDiscount && <span className="sp-off num">-{off}%</span>}
          {image ? (
            <img src={image} alt={product?.name} loading="lazy" />
          ) : (
            <svg
              viewBox="0 0 48 48"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="8" y="16" width="32" height="24" rx="4" />
              <path d="M16 16v-4h16v4" />
            </svg>
          )}
        </div>
      </Link>
      <div className="sp-txt">
        <Link to={`/marketplace/product/${product?.slug}/view`}>
          <h3>{product?.name}</h3>
          <div className="sp-price num">
            {formatCurrency(product?.price)}
            {hasDiscount && <s>{formatCurrency(product.listprice)}</s>}
          </div>
        </Link>
        <button type="button" className="sp-add" onClick={() => onAdd(product)} disabled={adding}>
          {adding ? "Adding…" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

const shopArt = (
  <svg viewBox="0 0 150 110" fill="none" aria-hidden="true">
    <rect x="20" y="40" width="110" height="60" rx="8" fill="var(--brand-soft)" />
    <path d="M14 42l10-24h102l10 24" stroke="var(--brand)" strokeWidth="4" strokeLinejoin="round" />
    <path
      d="M14 42c0 8 8 12 14 12s12-4 12-12c0 8 6 12 12 12s12-4 12-12c0 8 6 12 12 12s12-4 12-12c0 8 6 12 12 12s12-4 12-12c0 8 6 12 14 12"
      stroke="var(--brand)"
      strokeWidth="4"
      fill="none"
    />
    <rect x="60" y="66" width="30" height="34" rx="4" fill="var(--brand)" />
    <circle cx="124" cy="22" r="8" fill="#f59e0b" />
  </svg>
);

/** Only this shop's listings: "Showing N of M" and "Load more listings", as in the approved design. */
function StoreProducts({
  products,
  isLoading,
  isError,
  onRetry,
  total,
  hasMore,
  onLoadMore,
  loadingMore,
  onAdd,
  addingId,
}) {
  return (
    <section className="sp-panel" data-testid="store-products">
      <div className="sp-sec-head">
        <h2>All listings from this shop</h2>
        {total > 0 && (
          <small className="num">
            Showing {products.length} of {total}
          </small>
        )}
      </div>

      {isLoading && (
        <div className="sp-grid" data-testid="store-products-loading">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="sp-card" key={i}>
              <div className="sp-sk" style={{ aspectRatio: "4 / 3", borderRadius: 0 }} />
              <div className="sp-txt">
                <div className="sp-sk" style={{ height: 14, width: "80%" }} />
                <div className="sp-sk" style={{ height: 18, width: "50%", marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="sp-empty" data-testid="store-products-error">
          {shopArt}
          <h3>We could not load this shop's listings</h3>
          <p>Check your connection and try again.</p>
          <button type="button" className="sp-btn" style={{ marginTop: 12 }} onClick={onRetry}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="sp-empty" data-testid="store-products-empty">
          {shopArt}
          <h3>This shop is getting ready</h3>
          <p>Listings will appear here as soon as the seller adds them.</p>
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="sp-grid">
          {products.map((p, i) => (
            <StoreProductCard
              key={p.id}
              product={p}
              index={i}
              onAdd={onAdd}
              adding={addingId === p.id}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          className="sp-btn sp-more"
          onClick={onLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? "Loading…" : "Load more listings"}
        </button>
      )}
    </section>
  );
}

export default StoreProducts;
