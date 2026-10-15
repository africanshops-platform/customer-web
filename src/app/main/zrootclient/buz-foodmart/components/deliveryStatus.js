/**
 * What the customer should be told about WHO is delivering their food and where that stands (merchant-32 L4).
 * Mirrors customer-mobile's features/food/utils/deliveryStatus.ts, which carries the unit tests: keep the two in step.
 *
 * Returns null when there is nothing to say (not a delivery order, not paid, finished, or still being cooked).
 */
export function deliveryStatus(order) {
	// merchant-32 L5b: the partner waited at the door and could not hand the order over. The order is closed (delivered flag set
	// for the restaurant's settlement), so this is the one finished state the customer is still told about.
	if (order?.deliveryFailedAt && order.isPaid && !order.isCancelled && !order.isWalkIn) {
		return {
			state: 'FAILED',
			icon: '⚠️',
			title: 'We could not deliver your order',
			text: 'Your delivery partner waited at your door and could not reach you, so the order was closed. The delivery fee is not refunded. Contact support if this was a mistake.'
		};
	}
	if (!order || !order.isPaid || order.isCancelled || order.isDelivered || order.isWalkIn) return null;
	if ((order.orderType ?? 'DELIVERY') !== 'DELIVERY') return null;

	const name = order.deliveryPartnerName || 'Your delivery partner';

	if (order.deliveryHandledBy === 'PARTNER') {
		if (order.deliveryArrivedAt) {
			return {
				state: 'ARRIVED',
				icon: '🛵',
				title: `${name} has arrived`,
				text: 'Have your delivery code ready and give it to them when you have your food in hand.',
				urgent: true
			};
		}
		if (order.isShipped) {
			return { state: 'ON_THE_WAY', icon: '🛵', title: `${name} is on the way`, text: 'Your food has been picked up. Keep your delivery code handy.' };
		}
		return { state: 'ASSIGNED', icon: '✅', title: `${name} will deliver your order`, text: 'They are heading to the restaurant to collect it.' };
	}

	if (order.deliveryHandledBy === 'SELF') {
		return { state: 'SELF', icon: '🍽️', title: 'The restaurant is delivering your order', text: 'Keep your delivery code ready for when it arrives.' };
	}

	// Ready but nobody has taken it yet.
	if (order.kitchenStage === 'READY' || order.deliveryUnclaimedAt) {
		return { state: 'FINDING', icon: '🔎', title: 'Finding a delivery partner', text: 'Your food is ready. We are matching it with a delivery partner now.' };
	}

	return null;
}
