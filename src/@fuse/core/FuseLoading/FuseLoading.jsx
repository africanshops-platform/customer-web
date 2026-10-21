import { useTimeout } from '@fuse/hooks';
import clsx from 'clsx';
import { useState } from 'react';
import SectionSkeleton from 'app/shared-components/loading/SectionSkeleton';

/**
 * The default "waiting for data" state of the platform (design-system-1, state D): a grey shape of the content with a small brand mark.
 * It replaces the old full-screen spiral, which now lives in ProcessingState and is for work in progress (paying, saving, submitting).
 * Prefer SectionSkeleton directly with a `variant` that matches the component; this wrapper keeps the many existing
 * `if (isLoading) return <FuseLoading />` call sites consistent without editing each one.
 */
function FuseLoading({ delay = 0, className, label = 'Loading', variant = 'list' }) {
	const [show, setShow] = useState(!delay);

	useTimeout(() => {
		setShow(true);
	}, delay);

	return (
		<div className={clsx(className, 'w-full', !show && 'hidden')}>
			<SectionSkeleton label={label} variant={variant} />
		</div>
	);
}

export default FuseLoading;
