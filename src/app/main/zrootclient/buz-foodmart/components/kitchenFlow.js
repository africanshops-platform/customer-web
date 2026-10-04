/** Client copy of libs/interfaces food-kitchen.ts (customer-facing wording). The service enforces; this renders. */
export const TRACK_LABEL = { INSTANT: 'Ready now', A_LA_CARTE: 'Made to order', COOK_TO_ORDER: 'Chef-booked' };

export const MODE_LABEL = { READY: 'Ready now', A_LA_CARTE: 'Made to order', COOK_TO_ORDER: 'Chef-booked' };

export const STAGE_COPY = {
	AWAITING_ACCEPTANCE: { label: 'Chef confirming', says: 'Your payment is safe. The chef has up to 2 hours to accept your booking — if they cannot, you are refunded in full.' },
	RECEIVED: { label: 'Order received', says: 'The kitchen has your order.' },
	ACCEPTED: { label: 'Booking accepted', says: 'The chef accepted your booking and is planning your meal.' },
	GONE_TO_MARKET: { label: 'At the market', says: 'The chef has gone to the market to source fresh ingredients for you.' },
	IN_PREPARATION: { label: 'Cooking', says: 'Your food is being prepared right now.' },
	READY: { label: 'Ready', says: 'Your order is ready.' },
	OUT_FOR_DELIVERY: { label: 'On the way', says: 'Your order is on its way to you.' },
	DELIVERED: { label: 'Delivered', says: 'Enjoy your meal!' },
	DECLINED: { label: 'Declined', says: 'This booking could not be taken. Your payment is being refunded in full.' }
};

export function stageFlow(track, orderType = 'DELIVERY') {
	const ship = orderType === 'DELIVERY' ? ['OUT_FOR_DELIVERY', 'DELIVERED'] : ['DELIVERED'];
	if (track === 'COOK_TO_ORDER') return ['AWAITING_ACCEPTANCE', 'ACCEPTED', 'GONE_TO_MARKET', 'IN_PREPARATION', 'READY', ...ship];
	if (track === 'A_LA_CARTE') return ['RECEIVED', 'IN_PREPARATION', 'READY', ...ship];
	return ['RECEIVED', 'READY', ...ship];
}

export function currentStage(order) {
	if (order?.kitchenStage) return order.kitchenStage;
	if (order?.isDelivered) return 'DELIVERED';
	if (order?.isShipped) return 'OUT_FOR_DELIVERY';
	if (order?.isPacked) return 'READY';
	return 'RECEIVED';
}

export function timeLeft(iso, now = Date.now()) {
	if (!iso) return null;
	const ms = new Date(iso).getTime() - now;
	if (Number.isNaN(ms)) return null;
	if (ms <= 0) return null;
	const m = Math.floor(ms / 60000);
	const h = Math.floor(m / 60);
	if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
	return h ? `${h}h ${m % 60}m` : `${m}m`;
}
