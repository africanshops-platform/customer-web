import PageSkeleton from 'app/shared-components/loading/PageSkeleton';

/**
 * Kept so existing imports keep working. It is now the platform whole-page skeleton (design-system-1, state B) with a grid of cards.
 * New code should import PageSkeleton from the loading kit directly.
 */
function ContentLoadingPlaceholder({ title = 'Loading', subtitle }) {
	return <PageSkeleton title={title} subtitle={subtitle} body="cards" />;
}

export default ContentLoadingPlaceholder;
