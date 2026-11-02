import { PLATFORM_ORDER_TEL } from "../../../shared-contact/platformContact";

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/**
 * The shop's identity card, as in the approved design: cover, logo, name, Verified badge (only when the shop really is
 * verified), where it trades from and since when, and its listing count. Followers and posts join the stats row, and a
 * Follow button joins the actions, when the business feed ships.
 */
function StoreHero({ shopData, listingsTotal }) {
  const meta = [
    shopData?.marketName,
    shopData?.memberSince ? `Member since ${shopData.memberSince}` : null,
  ].filter(Boolean);

  return (
    <section className="sp-panel sp-hero" data-testid="store-hero">
      <div className="sp-cover" role="img" aria-label="Shop cover" />
      <div className="sp-hero-body">
        <div className="sp-logo">
          <span>{initials(shopData?.shopName) || "S"}</span>
        </div>
        <div>
          <h1>
            {shopData?.shopName}
            {shopData?.isVerified && (
              <span className="sp-verified">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden="true"
                >
                  <path d="M5 12l5 5 9-10" />
                </svg>
                Verified
              </span>
            )}
          </h1>
          {meta.length > 0 && (
            <div className="sp-meta">
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}
        </div>
        <div className="sp-cta">
          <a className="sp-btn sp-primary" href={PLATFORM_ORDER_TEL}>
            Call to order
          </a>
        </div>
      </div>
      <div className="sp-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))" }}>
        <div>
          <b className="num">{listingsTotal ?? "–"}</b>
          <span>{listingsTotal === 1 ? "Listing" : "Listings"}</span>
        </div>
      </div>
    </section>
  );
}

export default StoreHero;
