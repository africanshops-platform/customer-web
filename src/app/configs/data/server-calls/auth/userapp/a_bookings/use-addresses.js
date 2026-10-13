import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
	createUserAddressApi,
	getUserAddressesApi,
	getSingleUserAddressApi,
	updateUserAddressApi,
	deleteUserAddressApi,
	setDefaultUserAddressApi
} from 'app/configs/data/client/RepositoryAuthClient';
import { toast } from 'react-toastify';
import { handleApiError } from 'app/configs/data/utils/handleApiError';

/** *
 * ==========================================================================
 * USER ADDRESS CRUD OPERATIONS
 * ==========================================================================
 */

/** ** 1) Get All User Addresses */
export function useGetUserAddresses({ enabled = true } = {}) {
	return useQuery(['__userAddresses'], () => getUserAddressesApi(), {
		enabled, // pass false for guests: an unauthenticated call 401s and trips the auth-refresh/logout handler
		staleTime: 5 * 60 * 1000, // 5 minutes
		select: (data) => data?.data?.addresses || []
	});
}

/** ** 2) Get Single User Address */
export function useGetSingleUserAddress(addressId) {
	return useQuery(['__userAddress', addressId], () => getSingleUserAddressApi(addressId), {
		enabled: Boolean(addressId),
		select: (data) => data?.data?.address || null
	});
}

/** ** 3) Create User Address */
export function useCreateUserAddress() {
	const queryClient = useQueryClient();

	return useMutation(
		(formData) => createUserAddressApi(formData),
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message || 'Address created successfully!');
					queryClient.invalidateQueries(['__userAddresses']);
				} else {
					toast.error(data?.data?.message || 'Failed to create address');
				}
			},
			onError: (error) => {
				handleApiError(error, 'Failed to create address');
			}
		}
	);
}

/** ** 4) Update User Address */
export function useUpdateUserAddress() {
	const queryClient = useQueryClient();

	return useMutation(
		({ addressId, formData }) => updateUserAddressApi(addressId, formData),
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message || 'Address updated successfully!');
					queryClient.invalidateQueries(['__userAddresses']);
					queryClient.invalidateQueries(['__userAddress']);
				} else {
					toast.error(data?.data?.message || 'Failed to update address');
				}
			},
			onError: (error) => {
				handleApiError(error, 'Failed to update address');
			}
		}
	);
}

/** ** 5) Delete User Address */
export function useDeleteUserAddress() {
	const queryClient = useQueryClient();

	return useMutation(
		(addressId) => deleteUserAddressApi(addressId),
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message || 'Address deleted successfully!');
					queryClient.invalidateQueries(['__userAddresses']);
				} else {
					toast.error(data?.data?.message || 'Failed to delete address');
				}
			},
			onError: (error) => {
				handleApiError(error, 'Failed to delete address');
			}
		}
	);
}

/** ** 6) Set Default User Address */
export function useSetDefaultUserAddress() {
	const queryClient = useQueryClient();

	return useMutation(
		(addressId) => setDefaultUserAddressApi(addressId),
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message || 'Default address updated successfully!');
					queryClient.invalidateQueries(['__userAddresses']);
				} else {
					toast.error(data?.data?.message || 'Failed to set default address');
				}
			},
			onError: (error) => {
				handleApiError(error, 'Failed to set default address');
			}
		}
	);
}
