import { getEngineeringShopsApi } from 'app/configs/data/client/RepositoryClient';
import { useQuery } from 'react-query';

export default function useGetEngineeringShops(specialty) {
	return useQuery(['__engineeringShops', specialty], () => getEngineeringShopsApi(specialty), {
		staleTime: 30000 // shop locations change rarely; consider fresh for 30s
	});
}
