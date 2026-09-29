import { useQuery } from 'react-query';
import { getLegalDocumentByKeyApi } from '../configs/data/client/RepositoryClient';

/** Fetches a published legal document by its canonical key (see
 * app/constants/legalDocumentKeys.js). A document that doesn't exist, or
 * exists only as an unpublished draft, both 404 — react-query surfaces
 * that as `isError`, not a thrown render error, so the page can show a
 * real "not published yet" state instead of crashing. */
export function useLegalDocument(key) {
	return useQuery(['legal-document', key], () => getLegalDocumentByKeyApi(key), {
		select: (res) => res.data,
		enabled: Boolean(key),
		retry: false
	});
}
