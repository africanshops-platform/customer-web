import { useQuery } from 'react-query';
import { getUserReferralLinksApi } from '../../client/RepositoryAuthClient';

/** This user's own referral code + shareable links — idempotent on the backend (never rotates an existing code). */
export function useReferralLinks() {
	return useQuery(['__userReferralLinks'], getUserReferralLinksApi, {
		select: (res) => res?.data ?? null
	});
}
