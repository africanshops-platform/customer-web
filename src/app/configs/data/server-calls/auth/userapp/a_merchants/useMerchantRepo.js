import { getMerchantPreviewApi, getMarketsByLgaId } from 'app/configs/data/client/RepositoryClient';
import { useQuery } from 'react-query';

/**
 * Hook to fetch merchant preview data by merchant ID
 * @param {string} merchantId - The merchant ID to fetch preview for
 * @returns {object} React Query result with merchant data
 */
export function useGetMerchantPreview(merchantId) {
	return useQuery(['__merchantPreview', merchantId], () => getMerchantPreviewApi(merchantId), {
		enabled: Boolean(merchantId), // Only run query if merchantId exists
		staleTime: 30000, // Consider data fresh for 30 seconds
		retry: 2 // Retry failed requests up to 2 times
	});
}

/**
 * Public seller details for a product's shop, with the shop's market (name + coordinates)
 * resolved from the LGA's operational markets, the same way the checkout page resolves a pickup market.
 * @param {string} shopId - The shop (merchant) id carried on the product / cart line
 */
export function useShopSellerInfo(shopId) {
	const preview = useGetMerchantPreview(shopId);
	const merchant = preview.data?.data?.merchant;

	const markets = useQuery(['__marketsByLga', merchant?.businezLga], () => getMarketsByLgaId(merchant.businezLga), {
		enabled: Boolean(merchant?.businezLga),
		staleTime: 300000
	});
	const market = markets.data?.data?.markets?.find((m) => m.id === merchant?.market);

	return { merchant, market, isLoading: preview.isLoading || (Boolean(merchant?.businezLga) && markets.isLoading) };
}
