import { getMachineTypesApi } from 'app/configs/data/client/RepositoryClient';
import { useQuery } from 'react-query';

/**
 * Public machine-type taxonomy (make/model/engine, Phase E1's 21-row seed) —
 * powers the "what kind of machine is this" autocomplete when registering a
 * machine (Phase E6c). No auth needed, same as the shop directory lookups.
 */
export default function useGetMachineTypes(category) {
	return useQuery(['__machineTypes', category], () => getMachineTypesApi(category), {
		staleTime: 5 * 60 * 1000 // taxonomy data, essentially static
	});
}
