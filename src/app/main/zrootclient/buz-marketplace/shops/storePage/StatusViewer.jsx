import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { PLATFORM_ORDER_TEL } from "../../../shared-contact/platformContact";
import { timeLeft } from "./feedTime";

const SECONDS_PER_STATUS = 6;

/** Finished statuses are full, the current one fills as it plays, the rest are empty. */
function barWidth(i, index, progress) {
  if (i < index) return "100%";
  if (i === index) return `${Math.min(progress, 100)}%`;
  return "0%";
}

/**
 * Full-screen status viewer: one photo at a time with progress bars, tap right or left (or the arrow keys) to move,
 * Escape to close. The button on a status opens the shop's own product, or the order line; there is never a free link.
 */
function StatusViewer({ statuses, start = 0, shopName, onClose }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(start);
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);
  const status = statuses[index];

  const next = useCallback(() => {
    if (index >= statuses.length - 1) onClose();
    else {
      setIndex(index + 1);
      setProgress(0);
    }
  }, [index, statuses.length, onClose]);

  const previous = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setProgress(0);
  }, []);

  useEffect(() => {
    timer.current = setInterval(() => setProgress((p) => p + 100 / (SECONDS_PER_STATUS * 20)), 50);
    return () => clearInterval(timer.current);
  }, [index]);

  useEffect(() => {
    if (progress >= 100) next();
  }, [progress, next]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous, onClose]);

  if (!status) return null;
  const { action } = status;

  const act = () => {
    if (action?.kind === "PRODUCT" && action.target) {
      onClose();
      navigate(`/marketplace/product/${action.target}/view`);
    }
  };

  // on the page body, so no column's stacking context can hide it
  return createPortal(
    <div className="sp-story" role="dialog" aria-modal="true" aria-label="Status" data-testid="status-viewer">
      <div className="sp-story-card">
        <div className="sp-story-bars">
          {statuses.map((s, i) => (
            <span key={s.id}>
              <i style={{ width: barWidth(i, index, progress) }} />
            </span>
          ))}
        </div>
        <div className="sp-story-top">
          <strong>{shopName || status.shopName}</strong>
          <small>{timeLeft(status.expiresAt)}</small>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <img className="sp-story-img" src={status.media.url} alt={status.caption || "Status photo"} />
        <button type="button" className="sp-story-zone sp-story-prev" onClick={previous} aria-label="Previous status" />
        <button type="button" className="sp-story-zone sp-story-next" onClick={next} aria-label="Next status" />
        <div className="sp-story-bottom">
          {status.caption && <p>{status.caption}</p>}
          {action?.kind === "PRODUCT" && (
            <button type="button" className="sp-story-cta" onClick={act}>
              {action.label || "Shop now"}
            </button>
          )}
          {action?.kind === "CALL" && (
            <a className="sp-story-cta" href={PLATFORM_ORDER_TEL}>
              {action.label || "Call to order"}
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default StatusViewer;
