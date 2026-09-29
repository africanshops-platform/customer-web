/**
 * Canonical type scale — the default font sizing for every screen built in
 * this app going forward. Founder directive (2026-09-03): this scale
 * should be the standard across every Fuse-based web app in this monorepo
 * (marketplace, shop-dashboard, control-dashboard, civic-web) — they all
 * share the identical `html { font-size: 62.5% }` base (src/styles/app-base.css),
 * so the same clamp() values apply correctly to all of them without
 * per-app tuning. Originated in civic-web (civic-shared/typography.js,
 * see the civicweb-typography-scale memory) after "really tiny" text was
 * found on the civic landing page — same root cause applies here.
 *
 * Why this exists: `1rem = 10px` here, not the usual 16px. Values that
 * "look right" for a normal 16px-rem app (e.g. `0.95rem` body text)
 * collapse to ~9.5px here — real, tiny, illegible text.
 */
export const TYPE = {
	meta: 'clamp(1.2rem, 1.8vw, 1.5rem)', // small labels, timestamps, badges, captions
	body: 'clamp(1.3rem, 2vw, 1.64rem)', // standard paragraph/body copy
	bodyLg: 'clamp(1.4rem, 2.2vw, 1.8rem)', // emphasized body text, card copy
	cardTitle: 'clamp(1.5rem, 2.2vw, 1.8rem)', // card/tile titles
	btn: 'clamp(1.3rem, 2vw, 1.56rem)', // button labels
	subH: 'clamp(1.4rem, 2.2vw, 1.8rem)', // sub-headings (h3/h4-level)
	sectionH: 'clamp(2.2rem, 3.6vw, 3rem)', // section headings (h2-level)
	hero: 'clamp(2.4rem, 5.5vw, 4.2rem)' // page hero headline (h1-level)
};

export default TYPE;
