import { Chip, Button } from "@mui/material";
import { LocalOffer, Storefront, ErrorOutline } from "@mui/icons-material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { formatCurrency } from "src/app/main/vendors-shop/PosUtils";
import { SectionSkeleton } from "src/app/shared-components/loading";
import ProductPaginationBar from "../marketplace/shared-components/ProductPaginationBar";

function StoreProductCard({ product }) {
  const hasDiscount = product?.listprice && product.listprice > product.price;
  const off = hasDiscount
    ? Math.round(((product.listprice - product.price) / product.listprice) * 100)
    : 0;
  const image = product?.imageLinks?.[0]?.url;

  return (
    <NavLinkAdapter
      to={`/marketplace/product/${product?.slug}/view`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      data-testid="store-product-card"
    >
      <div className="relative bg-orange-50" style={{ aspectRatio: "4 / 3" }}>
        {image ? (
          <img
            src={image}
            alt={product?.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(145deg, #fed7aa, #fdba74)" }}
          >
            <Storefront sx={{ fontSize: 44, color: "white", opacity: 0.9 }} />
          </div>
        )}
        {hasDiscount && (
          <Chip
            icon={<LocalOffer fontSize="small" />}
            label={`${off}% OFF`}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "#dc2626",
              color: "white",
              fontWeight: 800,
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 m-0 line-clamp-2">{product?.name}</h3>
        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
          <span
            className="text-lg font-extrabold text-orange-600"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatCurrency(product?.price)}
          </span>
          {hasDiscount && (
            <s className="text-xs text-gray-400">{formatCurrency(product.listprice)}</s>
          )}
        </div>
        {product?.unitweight?.unitname && (
          <span className="text-xs text-gray-500">per {product.unitweight.unitname}</span>
        )}
        <span className="mt-3 text-center text-sm font-bold text-orange-600 border-2 border-orange-600 rounded-xl py-1.5 group-hover:bg-orange-600 group-hover:text-white transition-colors">
          View listing
        </span>
      </div>
    </NavLinkAdapter>
  );
}

/**
 * Only this shop's listings, paged. Page and page size live in the URL (the parent owns them).
 */
function StoreProducts({
  products,
  isLoading,
  isError,
  onRetry,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden" data-testid="store-products">
      <div className="flex justify-between items-center gap-3 px-5 sm:px-6 pt-5">
        <h2 className="text-lg font-bold text-gray-900 m-0">All listings from this shop</h2>
        {total > 0 && (
          <span className="text-sm text-gray-500" style={{ fontVariantNumeric: "tabular-nums" }}>
            {total} {total === 1 ? "listing" : "listings"}
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {isLoading && <SectionSkeleton variant="cards" rows={6} />}

        {isError && !isLoading && (
          <div className="text-center py-10" data-testid="store-products-error">
            <ErrorOutline sx={{ fontSize: 44, color: "#ea580c" }} />
            <h3 className="text-base font-bold text-gray-900 mt-2 mb-1">
              We could not load this shop's listings
            </h3>
            <p className="text-sm text-gray-500 mb-3">Check your connection and try again.</p>
            <Button
              onClick={onRetry}
              variant="outlined"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderColor: "#ea580c",
                color: "#ea580c",
              }}
            >
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="text-center py-10" data-testid="store-products-empty">
            <svg viewBox="0 0 150 110" width="150" fill="none" aria-hidden="true">
              <rect x="20" y="40" width="110" height="60" rx="8" fill="#fff1e6" />
              <path
                d="M14 42l10-24h102l10 24"
                stroke="#ea580c"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <rect x="60" y="66" width="30" height="34" rx="4" fill="#ea580c" />
              <circle cx="124" cy="22" r="8" fill="#f59e0b" />
            </svg>
            <h3 className="text-base font-bold text-gray-900 mt-2 mb-1">
              This shop is getting ready
            </h3>
            <p className="text-sm text-gray-500 m-0">
              Listings will appear here as soon as the seller adds them.
            </p>
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}
          >
            {products.map((p) => (
              <StoreProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {total > limit && (
        <div className="px-5 sm:px-6 pb-6">
          <ProductPaginationBar
            totalItems={total}
            currentPage={page}
            itemsPerPage={limit}
            onPageChange={onPageChange}
            onItemsPerPageChange={onLimitChange}
          />
        </div>
      )}
    </div>
  );
}

export default StoreProducts;
