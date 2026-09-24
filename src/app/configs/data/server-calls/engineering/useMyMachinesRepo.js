import {
	createRegisteredMachineApi,
	updateRegisteredMachineApi,
	deleteRegisteredMachineApi,
	getMyRegisteredMachinesApi,
	getRegisteredMachineByIdApi
} from 'app/configs/data/client/RepositoryAuthClient';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import reportEngineeringApiError from './reportEngineeringApiError';

/**
 * Registered machines (Phase E6c, customer-facing marketplace app) — a
 * machine is customer-owned regardless of which shop(s) it gets serviced
 * at, same ownership shape the backend already enforces server-side.
 */

/** *Get all of the current user's registered machines */
export function useGetMyRegisteredMachines() {
	return useQuery(['__myMachines'], () => getMyRegisteredMachinesApi(), {
		staleTime: 30000,
		onError: (error) => reportEngineeringApiError(error, 'Failed to fetch your machines')
	});
}

/** *Get a single registered machine */
export function useGetRegisteredMachine(machineId) {
	return useQuery(['__myMachine', machineId], () => getRegisteredMachineByIdApi(machineId), {
		enabled: Boolean(machineId),
		onError: (error) => reportEngineeringApiError(error, 'Failed to fetch this machine')
	});
}

/** *Register a new machine */
export function useCreateRegisteredMachine() {
	const queryClient = useQueryClient();

	return useMutation((formData) => createRegisteredMachineApi(formData), {
		onSuccess: () => {
			queryClient.invalidateQueries('__myMachines');
			toast.success('Machine registered!');
		},
		onError: (error) => reportEngineeringApiError(error, 'Failed to register machine')
	});
}

/** *Update a registered machine */
export function useUpdateRegisteredMachine() {
	const queryClient = useQueryClient();

	return useMutation(({ machineId, formData }) => updateRegisteredMachineApi(machineId, formData), {
		onSuccess: (_response, variables) => {
			queryClient.invalidateQueries('__myMachines');
			queryClient.invalidateQueries(['__myMachine', variables.machineId]);
			toast.success('Machine updated!');
		},
		onError: (error) => reportEngineeringApiError(error, 'Failed to update machine')
	});
}

/** *Delete a registered machine */
export function useDeleteRegisteredMachine() {
	const queryClient = useQueryClient();

	return useMutation((machineId) => deleteRegisteredMachineApi(machineId), {
		onSuccess: () => {
			queryClient.invalidateQueries('__myMachines');
			toast.success('Machine removed');
		},
		onError: (error) => reportEngineeringApiError(error, 'Failed to remove machine')
	});
}
