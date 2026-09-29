import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import {
	applyToPositionApi,
	getMyApplicationsApi
} from '../configs/data/client/RepositoryAuthClient';
import { getOpenPositionsApi, getPositionByIdApi } from '../configs/data/client/RepositoryClient';
import { handleApiError } from '../configs/data/utils/handleApiError';

export function useOpenPositions(page = 1) {
	return useQuery(['careers_open_positions', page], () => getOpenPositionsApi(page), { keepPreviousData: true });
}

export function usePosition(id) {
	return useQuery(['careers_position', id], () => getPositionByIdApi(id), { enabled: Boolean(id) });
}

export function useMyApplications(enabled) {
	return useQuery('careers_my_applications', getMyApplicationsApi, { enabled: Boolean(enabled) });
}

export function useApplyToPosition() {
	const queryClient = useQueryClient();
	return useMutation(({ id, coverNote }) => applyToPositionApi(id, coverNote), {
		onSuccess: () => {
			toast.success('Application submitted! Track it under My Applications.');
			queryClient.invalidateQueries('careers_my_applications');
		},
		onError: (error) => handleApiError(error, 'Failed to submit your application')
	});
}
