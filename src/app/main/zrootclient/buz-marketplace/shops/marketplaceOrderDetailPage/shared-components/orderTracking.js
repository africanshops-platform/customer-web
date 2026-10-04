/**
 * Order tracking for orders handled by a market warehouse (W3d, 2026-10-01).
 *
 * For these orders the warehouse — not an admin by hand — moves the order, and the backend sets
 * `warehouseRouted` + `fulfillmentStage` alongside the usual isShipped / hasArrivedWarehouse /
 * isPacked flags. The old four-step list assumed "packed" came first; here packing happens AFTER
 * the goods reach the warehouse, so the steps are ordered the way things really happen.
 * Legacy orders (no `warehouseRouted`) keep the old list untouched.
 */
const STAGES = [
  'AWAITING_SELLERS',
  'RECEIVING',
  'READY_TO_PACK',
  'PACKING',
  'PACKED',
  'STAGED_FOR_DISPATCH',
  'HANDED_TO_LOGISTICS',
  'COMPLETED'
];

const rankOf = (stage) => STAGES.indexOf(stage);

/** done wins, then active, else todo. */
function stateOf(done, active) {
	if (done) return 'done';

	return active ? 'active' : 'todo';
}

export const isWarehouseRouted = (order) => Boolean(order?.warehouseRouted);

/** Ordered steps with a state of 'done' | 'active' | 'todo'. */
export function warehouseTimeline(order) {
  const rank = rankOf(order?.fulfillmentStage);
  const staged = rank >= rankOf('STAGED_FOR_DISPATCH');

  return [
    {
      key: 'sent',
      label: 'Sellers sending',
      state: stateOf(order?.isShipped, true),
      doneText: '✓ All sent',
      activeText: 'Waiting on sellers…'
    },
    {
      key: 'arrived',
      label: 'At warehouse',
      state: stateOf(order?.hasArrivedWarehouse, order?.isShipped),
      doneText: '✓ Arrived',
      activeText: 'On the way…'
    },
    {
      key: 'packing',
      label: 'Packing',
      state: stateOf(order?.isPacked, rank >= rankOf('PACKING')),
      doneText: '✓ Packed',
      activeText: 'Being packed…'
    },
    {
      key: 'ready',
      label: 'Ready for delivery',
      state: stateOf(staged, false),
      doneText: '✓ Ready',
      activeText: ''
    },
    {
      key: 'delivery',
      label: 'Delivery',
      state: stateOf(order?.isDelivered, staged),
      doneText: '✓ Delivered',
      activeText: 'Waiting for a delivery partner…'
    }
  ];
}

/** Headline status for a warehouse-routed order. */
export function warehouseStatusLabel(order) {
  if (order?.isDelivered) return 'Delivered';
  const rank = rankOf(order?.fulfillmentStage);
  if (rank >= rankOf('STAGED_FOR_DISPATCH')) return 'Ready for delivery';
  if (order?.isPacked) return 'Packed';
  if (rank >= rankOf('PACKING')) return 'Packing';
  if (order?.hasArrivedWarehouse) return 'At Warehouse';
  if (order?.isShipped) return 'On its way to the warehouse';
  return 'Processing';
}

/** Has packing started? After that an item can no longer be cancelled (the packed order stays whole). */
export function packingStarted(order) {
	if (!order) return false;

	if (isWarehouseRouted(order)) return rankOf(order.fulfillmentStage) >= rankOf('PACKING');

	return Boolean(order.isPacked || order.isShipped);
}

/** The customer may cancel an item only before packing starts (the server enforces the same rule). */
export const canCancelItem = (order, item) => !item?.isCanceled && !item?.isDelivered && !packingStarted(order);

/** What to tell the customer about an item that is no longer coming. */
export function droppedLabel(reason) {
	if (reason === 'CANCELED_BY_CUSTOMER') return 'Cancelled — refund requested';

	return reason ? 'Unavailable — refund on its way' : 'Cancelled';
}

/**
 * The post-delivery complaint window (48h). `open`: the customer can still report an issue (a hold is placed
 * on the merchant's payout); `closed`: defect complaints are no longer considered; `none`: the order predates
 * the window, so reporting stays available as before.
 */
export function complaintWindow(order, now = Date.now()) {
	if (!order?.isDelivered) return { state: 'none' };

	if (!order.complaintWindowEndsAt) return { state: 'none' };

	const endsAt = new Date(order.complaintWindowEndsAt);
	const msLeft = endsAt.getTime() - now;

	if (msLeft <= 0) return { state: 'closed', endsAt };

	return { state: 'open', endsAt, hoursLeft: Math.max(1, Math.ceil(msLeft / 3600000)) };
}
