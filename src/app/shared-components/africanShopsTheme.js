/** Shared orange-gradient hero + fade-up motion used across every real
 * public-facing page this app has (About, Careers, and now Legal
 * documents) — one visual language, defined once. */
export const ORANGE_GRADIENT = 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)';

export const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 24 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }
});
