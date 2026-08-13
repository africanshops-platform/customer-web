import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { getSessionsApi, revokeSessionApi } from '../../client/RepositoryAuthClient';

/** Active-devices list for the signed-in user's own Security settings. */
export function useSessions() {
	return useQuery(['__userSessions'], getSessionsApi, {
		select: (res) => res?.data?.sessions ?? []
	});
}

export function useRevokeSession() {
	const queryClient = useQueryClient();

	return useMutation(revokeSessionApi, {
		onSuccess: () => {
			toast.success('Device signed out');
			queryClient.invalidateQueries('__userSessions');
		},
		onError: (error) => {
			toast.error(error?.response?.data?.message || 'Failed to sign out that device');
		}
	});
}
