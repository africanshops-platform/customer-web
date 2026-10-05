import { useQuery } from 'react-query';
import { getPlatformStats } from '../../client/clientToApiRoutes';

/**
 * Real headline figures (customers, merchants, products) from the gateway's public, cached GET /platform-stats.
 * A figure of null/0 means "not available" - callers must hide it, never show a placeholder.
 */
export default function usePlatformStats() {
	return useQuery(['platform-stats'], () => getPlatformStats().then((r) => r.data), {
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		retry: 1
	});
}
