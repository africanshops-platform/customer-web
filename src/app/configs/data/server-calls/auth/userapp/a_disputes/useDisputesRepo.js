import {
	addMyDisputeNoteApi,
	createDisputeApi,
	getMyDisputeDetailApi,
	getMyDisputesApi
} from 'app/configs/data/client/RepositoryAuthClient';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { handleApiError } from 'app/configs/data/utils/handleApiError';
import { toast } from 'react-toastify';

/** *
 * #################################################################
 * DISPUTES (2026-08-12) — self-service, customer side
 * #################################################################
 */

export function useGetMyDisputes(filters = {}) {
	return useQuery(['__my_disputes', filters], () => getMyDisputesApi(filters), {
		keepPreviousData: true,
		staleTime: 15000
	});
}

export function useGetMyDisputeDetail(disputeId) {
	return useQuery(['__my_dispute', disputeId], () => getMyDisputeDetailApi(disputeId), {
		enabled: Boolean(disputeId)
	});
}

export function useCreateDispute() {
	const queryClient = useQueryClient();

	return useMutation((dto) => createDisputeApi(dto), {
		onSuccess: () => {
			toast.success('Dispute submitted.');
			queryClient.invalidateQueries('__my_disputes');
		},
		onError: (error) => handleApiError(error, 'Failed to submit dispute')
	});
}

/** Right of reply (2026-08-12) — either the raiser or the named counterparty can add a note. */
export function useAddDisputeNote() {
	const queryClient = useQueryClient();

	return useMutation(({ disputeId, note }) => addMyDisputeNoteApi(disputeId, note), {
		onSuccess: (_data, variables) => {
			toast.success('Reply sent.');
			queryClient.invalidateQueries(['__my_dispute', variables.disputeId]);
		},
		onError: (error) => handleApiError(error, 'Failed to send reply')
	});
}
