import {
	addToUserCommodityCartApi,
	addToWishlistApi,
	calculateCartShippingApi,
	cancelUserItemInInvoiceApi,
	createProductReviewApi,
	getMyWishlistApi,
	getPlacedOrders,
	getUserInvoices,
	getUserShoppingCart,
	getUserShoppingCartForAuthAndGuest,
	getWishlistItemStatusApi,
	payAndPlaceOrderApi,
	reissueDeliveryCodeApi,
	removeCommodityFromCartApi,
	removeFromWishlistApi,
	requestRefundOnUserItemInInvoiceApi,
	updateCommodityCartQtyApi
} from 'app/configs/data/client/RepositoryAuthClient';
import { getAllProducts, getProductByCategory, getProductById, getProductReviews } from 'app/configs/data/client/RepositoryClient';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { handleApiError as handleNestJSError } from 'app/configs/data/utils/handleApiError';

/** *
 * #################################################################
 * GUEST PRODUCT HANDLING STARTS HERE
 * #################################################################
 */

export default function useGetAllProducts(filters = {}) {
	// return useQuery(["__marketplace_products"], getAllProducts);
	// console.log("Filtes in Get-All-Producst", filters)
	return useQuery(['__marketplace_products', filters], () => getAllProducts(filters), {
		keepPreviousData: true, // Keep showing previous data while fetching new filtered data
		staleTime: 20000 // Consider data fresh for 20 seconds
	});
} // (Msvs => Done)

export function useGetProductByCategory(category) {
	if (!category) {
		return {};
	}

	return useQuery(['__marketplace_products_by_products', category], () => getProductByCategory(category), {
		enabled: Boolean(category)
	});
}

export function useGetSingleProduct(productSlug) {
	// if(!productSlug || productSlug === 'new'){
	//   return {};
	// }
	return useQuery(['__marketplace_products_byslug', productSlug], () => getProductById(productSlug), {
		enabled: Boolean(productSlug)
	});
} // (Msvs => Done)

/** Product reviews -- public, visible to everyone regardless of auth state (2026-09-27, customer-9) */
export function useGetProductReviews(productId) {
	return useQuery(['__product_reviews', productId], () => getProductReviews(productId), {
		enabled: Boolean(productId)
	});
}

/** *
 * #################################################################
 * GUEST PRODUCT HANDLING ENDS HERE
 * #################################################################
 */

/** *
 * #################################################################
 * WISHLIST MANAGEMENT STARTS HERE (2026-09-27, customer-10)
 * #################################################################
 */
export function useGetMyWishlist() {
	return useQuery(['__wishlist'], () => getMyWishlistApi());
}

export function useWishlistItemStatus(productId) {
	return useQuery(['__wishlist_item_status', productId], () => getWishlistItemStatusApi(productId), {
		enabled: Boolean(productId)
	});
}

export function useAddToWishlist() {
	const queryClient = useQueryClient();
	return useMutation((productId) => addToWishlistApi(productId), {
		onSuccess: (_data, productId) => {
			queryClient.invalidateQueries(['__wishlist']);
			queryClient.invalidateQueries(['__wishlist_item_status', productId]);
		},
		onError: handleNestJSError
	});
}

export function useRemoveFromWishlist() {
	const queryClient = useQueryClient();
	return useMutation((productId) => removeFromWishlistApi(productId), {
		onSuccess: (_data, productId) => {
			queryClient.invalidateQueries(['__wishlist']);
			queryClient.invalidateQueries(['__wishlist_item_status', productId]);
		},
		onError: handleNestJSError
	});
}
/** *
 * #################################################################
 * WISHLIST MANAGEMENT ENDS HERE
 * #################################################################
 */

/** *
 * #################################################################
 * PRODUCT REVIEWS (WRITE) START HERE (2026-09-27, customer-9)
 * #################################################################
 */
export function useCreateProductReview() {
	const queryClient = useQueryClient();
	return useMutation((reviewData) => createProductReviewApi(reviewData), {
		onSuccess: (_data, reviewData) => {
			toast.success('Thanks for your review!');
			queryClient.invalidateQueries(['__product_reviews', reviewData?.productId]);
		},
		onError: handleNestJSError
	});
}
/** *
 * #################################################################
 * PRODUCT REVIEWS (WRITE) END HERE
 * #################################################################
 */

/** *
 * #################################################################
 * COMMODITY CART MANAGEMENT STARTS HERE
 * #################################################################
 */
export function useMyCart(userId) {
	if (!userId || userId === 'new') {
		return {};
	}

	return useQuery(['__cart'], getUserShoppingCart);
} // (Msvs => Done)

/** *get menu of user marketplace cart items for both AuthUser && UnAuth-User */
export function useGetMyMarketplaceCartByUserCred(userId) {
	return useQuery(
		['__cart'],
		() => getUserShoppingCartForAuthAndGuest(),
		{ enabled: !!userId && userId !== 'new' }
	);
} // (Msvs => Done)
// export function useGetMyMarketplaceCartByUserCred(userId) {
//   if (!userId || userId === "new") {
//     return {};
//   }
//   //() =>
//   return useQuery(["__cart"], getUserShoppingCartForAuthAndGuest(),

//   );
// } //(Msvs => Done)

/** **Manage COMOODITY CART starts */
/** **Create add to foodcart : => Done for Africanshops */
export function useAddToCart() {
	const queryClient = useQueryClient();
	return useMutation(
		(cartItem) => {
			return addToUserCommodityCartApi(cartItem);
		},

		{
			onSuccess: (data) => {
				console.log('AddToCartData', data);

				if (data?.data?.success) {
					toast.success(`${data?.data?.message ? data?.data?.message : 'Item added to cart successfully!'}`);
					queryClient.invalidateQueries(['__cart'], { force: true });
					queryClient.invalidateQueries(['__marketplace_products'], { force: true });
					queryClient.refetchQueries('__cart', { force: true });
					queryClient.refetchQueries('__marketplace_products', { force: true });
				}

				// else if (data?.data?.error) {
				//   toast.error(data?.data?.error?.message);
				//   return;
				// } else {
				//   toast.info("something unexpected happened");
				//   return;
				// }
			}
		},
		{
			onError: handleNestJSError
		}
	);
}

/** Updated cart item quantity */
export function useUpdateCartItemQty() {
	// const navigate = useNavigate();
	const queryClient = useQueryClient();
	return useMutation(
		(cartItem) => {
			console.log('Run Product : ', cartItem);

			return updateCommodityCartQtyApi(cartItem);
		},

		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(
						`${data?.data?.message ? data?.data?.message : 'Cart item quantity updated successfully!'}`
					);
					queryClient.invalidateQueries(['__cart']);
					queryClient.refetchQueries('__cart', { force: true });
				} else if (data?.data?.error) {
					toast.error(data?.data?.error?.message);
				} else if (data?.data?.infomessage) {
					toast.info(data?.data?.infomessage);
				} else {
					toast.info('something unexpected happened');
				}
			}
		},
		{
			onError: handleNestJSError
		}
	);
}

/** remove cart item  */
export function useRemoveCartItem() {
	// const navigate = useNavigate();
	const queryClient = useQueryClient();
	return useMutation(
		(cartItem) => {
			return removeCommodityFromCartApi(cartItem);
		},

		{
			onSuccess: (data) => {
				if (data?.data?.success && data?.data?.updatedCartQty) {
					toast.success(data?.data?.message);
					queryClient.invalidateQueries(['__cart']);
					queryClient.refetchQueries('__cart', { force: true });
					// navigate(`/bookings/reservation/review/${data?.data?.createdReservation?._id}`);
				} else if (data?.data?.error) {
					toast.error(data?.data?.error?.message);
				} else if (data?.data?.infomessage) {
					toast.info(data?.data?.infomessage);
				} else {
					toast.info('something unexpected happened');
				}
			}
		},
		{
			onError: handleNestJSError
		}
	);
}

/** *
 * #################################################################
 * COMMODITY CART MANAGEMENT ENDS HERE
 * #################################################################
 */
/** -------------------------------------------------------------------------------------------------------- */

/** *
 * #################################################################
 * ORDER FOR COMMODITY MANAGEMENT STARTS HERE
 * #################################################################
 */

/** ***Ask for a NEW delivery code for an order (the old one stops working). The plaintext comes back once. */
export function useReissueDeliveryCode() {
	return useMutation((orderId) => reissueDeliveryCodeApi(orderId), {
		onError: handleNestJSError
	});
}

/** ***Pay and make payment for order */
export function usePayAndPlaceOrder() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation(
		(orderData) => {
			return payAndPlaceOrderApi(orderData);
		},

		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message);
					queryClient.invalidateQueries(['__cart']);
					queryClient.refetchQueries('__cart', { force: true });
					// The delivery code is shown ONCE on the success page (passed in route state, never
					// stored or put in the URL); after that the customer can only request a new one.
					navigate(
						`/marketplace/order/${data?.data?.data?.order?.id || data?.data?.data?.order?._id}/payment-success`,
						{ state: { deliveryCode: data?.data?.data?.deliveryCode ?? null } }
					);
				} else if (data?.data?.error) {
					toast.error(data?.data?.error?.message);
				} else {
					toast.info('something unexpected happened');
				}
			},
			// Bug fix: useMutation only reads its 2nd argument for options — a
			// 3rd object (the old `{ onError: handleNestJSError }` below) is
			// silently ignored, so a failed payment never surfaced any error at
			// all. Merged into the single options object react-query expects.
			onError: handleNestJSError
		}
	);
}

/** ***Live shipping cost estimate for the cart-review page — server computes real
 * per-shop cost from the authenticated user's actual cart (never a client-side guess).
 * No global error toast: an unresolved route while the user is still mid-selection isn't
 * an error worth interrupting them for — the caller shows an inline "unavailable" state
 * instead (see CartSummaryAndPay.jsx). */
export function useCalculateCartShipping() {
	return useMutation((destinationData) => calculateCartShippingApi(destinationData), {
		onError: (error) => {
			console.warn('Shipping calculation failed:', error?.response?.data || error?.message);
		}
	});
}

/** *Get Authenticated user orders */
export function useGetAuthUserOrders() {
	return useQuery(['__authuser_orders'], () => getUserInvoices(), {
		// enabled: Boolean(userId),
	});
}

/** *Get orders and order items  */
export function useGetAuthUserOrderItems(orderId) {
	// if(!orderId || orderId === 'new'){
	//   return {};
	// }
	return useQuery(['__authuser_order_items', orderId], () => getPlacedOrders(orderId), {
		enabled: Boolean(orderId)
	});
}

/** *Cancel Order Items */
export function useCancleOrderItem() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation(
		(orderItemData) => {
			return cancelUserItemInInvoiceApi(orderItemData);
		},

		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message);
					queryClient.invalidateQueries(['__authuser_order_items']);
					// queryClient.refetchQueries("__cart", { force: true });
					// navigate(`/marketplace/order/${data?.data?.order?._id}/payment-success`);
				} else if (data?.data?.error) {
					toast.error(data?.data?.error?.message);
				} else {
					toast.info('something unexpected happened');
				}
			}
		},
		{
			onError: handleNestJSError
		}
	);
}

/** ***Request refund on cancelled order item */
export function useRequestRefundOnOrderItem() {
	// const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation(
		(orderItemData) => {
			return requestRefundOnUserItemInInvoiceApi(orderItemData);
		},
		{
			onSuccess: (data) => {
				if (data?.data?.success) {
					toast.success(data?.data?.message);
					queryClient.invalidateQueries(['__authuser_order_items']);
				} else if (data?.data?.error) {
					toast.error(data?.data?.error?.message);
				} else {
					toast.info('something unexpected happened');
				}
			}
		},
		{
			onError: handleNestJSError
		}
	);
}
/** *
 * #################################################################
 * ORDER FOR COMMODITY MANAGEMENT ENDS HERE
 * #################################################################
 */
