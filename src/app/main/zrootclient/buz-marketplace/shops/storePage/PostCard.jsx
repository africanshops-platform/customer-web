import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABELS, timeAgo } from "./feedTime";

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const shareIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M4 12v7h16v-7M12 3v12M7 8l5-5 5 5" />
  </svg>
);

function MediaCarousel({ media, shopName }) {
  const [index, setIndex] = useState(0);
  if (!media?.length) return null;
  const many = media.length > 1;
  const go = (n) => setIndex((n + media.length) % media.length);

  return (
    <div className="sp-media" data-testid="post-media">
      {media.map((m, i) => (
        <div key={m.publicId || i} className={`sp-slide${i === index ? " on" : ""}`}>
          {m.kind === "VIDEO" ? (
            <span>Video</span>
          ) : (
            <img src={m.url} alt={`${shopName}, ${i + 1} of ${media.length}`} loading="lazy" />
          )}
        </div>
      ))}
      <span className="sp-count num" data-testid="post-media-count">
        {index + 1}/{media.length}
      </span>
      {many && (
        <>
          <button
            type="button"
            className="sp-nav l"
            aria-label="Previous photo"
            onClick={() => go(index - 1)}
          >
            &#8249;
          </button>
          <button
            type="button"
            className="sp-nav r"
            aria-label="Next photo"
            onClick={() => go(index + 1)}
          >
            &#8250;
          </button>
          <div className="sp-dots">
            {media.map((m, i) => (
              <i key={i} className={i === index ? "on" : ""} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({ event }) {
  const d = new Date(event.startsAt);
  if (Number.isNaN(d.getTime())) return null;
  return (
    <div className="sp-event" data-testid="post-event">
      <div className="sp-date">
        <small>{d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}</small>
        {d.getDate()}
      </div>
      <div>
        <b>{d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</b>
        <div className="sp-event-place">{event.place}</div>
      </div>
    </div>
  );
}

/** One post, as in the approved design. Reactions and comments join the action row when they ship (P1d). */
function PostCard({ post, onReport, onShare }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const category = CATEGORY_LABELS[post.category] || { label: post.category, tone: "" };
  const name = post.shopName || "Shop";

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  return (
    <article className="sp-panel sp-post" data-testid="store-post">
      <header>
        <div className="sp-av">{initials(name) || "S"}</div>
        <div>
          <b>{name}</b>
          <small>{timeAgo(post.createdAt)}</small>{" "}
          <span className={`sp-chip ${category.tone}`}>{category.label}</span>
        </div>
        <div className="sp-menu" ref={menuRef}>
          <button
            type="button"
            aria-label="More options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            &#8942;
          </button>
          {menuOpen && (
            <div className="sp-pop" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onReport(post);
                }}
              >
                Report post
              </button>
            </div>
          )}
        </div>
      </header>
      <p className="sp-post-text">{post.text}</p>
      <MediaCarousel media={post.media} shopName={name} />
      {post.event && <EventCard event={post.event} />}
      <div className="sp-actions">
        <button type="button" onClick={() => onShare(post)}>
          {shareIcon}Share
        </button>
      </div>
    </article>
  );
}

export default PostCard;
