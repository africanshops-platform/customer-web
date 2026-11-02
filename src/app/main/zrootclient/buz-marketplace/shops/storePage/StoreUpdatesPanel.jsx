/**
 * The right-hand side, as in the approved design's empty-shop state. Statuses and posts from the merchant replace the
 * two empty cards when the business feed ships; the layout, header and guidelines note are already in place.
 */
function StoreUpdatesPanel() {
  return (
    <div className="sp sp-feed" data-testid="store-updates-soon">
      <section className="sp-panel sp-status">
        <header>
          <h2>Updates</h2>
          <small>Statuses last 24 hours</small>
        </header>
        <p style={{ padding: "6px 16px 4px", color: "var(--muted)", fontSize: 13 }}>
          No statuses right now. New ones appear here for 24 hours.
        </p>
      </section>

      <div className="sp-rules" role="note">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
          style={{ flex: "none", marginTop: 1 }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5v.5" />
        </svg>
        <span>
          Posts here are about business, learning and growth. Up to 5 photos or videos per post,
          videos up to 10 minutes. Report anything that does not belong.
        </span>
      </div>

      <article className="sp-panel sp-empty">
        <svg viewBox="0 0 150 110" fill="none" aria-hidden="true">
          <rect x="30" y="14" width="90" height="84" rx="12" fill="var(--brand-soft)" />
          <circle cx="52" cy="38" r="9" fill="var(--brand)" />
          <rect x="68" y="32" width="38" height="6" rx="3" fill="var(--line)" />
          <rect x="68" y="44" width="26" height="6" rx="3" fill="var(--line)" />
          <rect x="42" y="62" width="66" height="26" rx="8" fill="var(--brand)" opacity=".85" />
          <path
            d="M62 78l8-8 8 8 6-6 8 8"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>No posts yet</h3>
        <p>
          Shop updates are on the way. Statuses, tips and events from this shop will show up here.
        </p>
      </article>
    </div>
  );
}

export default StoreUpdatesPanel;
