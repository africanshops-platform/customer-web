import { useState } from "react";
import { useStoreStatuses } from "src/app/aaqueryhooks/feedQueries";
import { timeLeft } from "./feedTime";
import StatusViewer from "./StatusViewer";

/** The 24 hour statuses of a shop, as a row of rings. Tapping one opens the viewer. Shows nothing at all when there are none. */
function StatusStrip({ shopId, shopName }) {
  const { data, isLoading } = useStoreStatuses(shopId);
  const [open, setOpen] = useState(null);
  const statuses = data?.data?.statuses ?? [];

  if (isLoading) {
    return (
      <section className="sp-panel sp-status" data-testid="store-statuses-loading">
        <div className="sp-sk" style={{ height: 78, margin: 16 }} />
      </section>
    );
  }
  if (!statuses.length) return null;

  return (
    <section className="sp-panel sp-status" data-testid="store-statuses">
      <header>
        <h2>Updates</h2>
        <small>Statuses last 24 hours</small>
      </header>
      <div className="sp-ring-row">
        {statuses.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="sp-ring"
            onClick={() => setOpen(i)}
            aria-label={`Open status ${i + 1} of ${statuses.length}`}
          >
            <span className="sp-ring-pic">
              <img src={s.media.url} alt="" loading="lazy" />
            </span>
            <small>{timeLeft(s.expiresAt)}</small>
          </button>
        ))}
      </div>
      {open !== null && (
        <StatusViewer
          statuses={statuses}
          start={open}
          shopName={shopName}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

export default StatusStrip;
