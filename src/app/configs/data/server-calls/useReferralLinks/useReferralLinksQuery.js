import { useQuery } from 'react-query';
import { getUserReferralLinksApi, getUserReferralAccrualsApi } from '../../client/RepositoryAuthClient';

/** This user's own referral code + shareable links — idempotent on the backend (never rotates an existing code). */
export function useReferralLinks() {
	return useQuery(['__userReferralLinks'], getUserReferralLinksApi, {
		select: (res) => res?.data ?? null
	});
}

/** This user's own referral revenue-share accruals — shallow, paginated (date/type/amount/status only). */
export function useReferralAccruals(page = 1, limit = 20) {
	return useQuery(['__userReferralAccruals', page, limit], () => getUserReferralAccrualsApi(page, limit), {
		select: (res) => res?.data ?? null,
		keepPreviousData: true
	});
}
