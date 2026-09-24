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

/**
 * Get all of the current user's registered machines.
 *
 * `enabled` defaults to true for callers that are already known to be
 * authenticated (e.g. MyMachinesPage, which redirects to /sign-in on mount
 * otherwise). Callers that can render for a logged-out guest — like
 * BookServiceDialog, which stays mounted-but-hidden on the public shop
 * detail page — MUST pass `enabled: false` until the user is actually
 * authenticated, or this fires a real 401 that the global AuthApi
 * interceptor turns into a real `window.location.reload()`
 * (resetSessionForShopUsers), which then reloads straight back into the
 * same unauthenticated state and fires again — a genuine infinite reload
 * loop for any guest visitor, confirmed live 2026-09-24 on
 * /engineering/shops/:id.
 */
export function useGetMyRegisteredMachines(enabled = true) {
	return useQuery(['__myMachines'], () => getMyRegisteredMachinesApi(), {
		enabled,
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
