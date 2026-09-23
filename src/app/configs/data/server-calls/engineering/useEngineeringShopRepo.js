import { getEngineeringShopByIdApi } from 'app/configs/data/client/RepositoryClient';
import { useQuery } from 'react-query';

export default function useGetEngineeringShop(shopId) {
	return useQuery(['__engineeringShop', shopId], () => getEngineeringShopByIdApi(shopId), {
		enabled: Boolean(shopId)
	});
}
