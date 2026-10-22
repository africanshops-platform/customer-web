import { deliveryStatus } from '../deliveryStatus';

const base = { isPaid: true, orderType: 'DELIVERY', kitchenStage: 'READY' };

describe('deliveryStatus', () => {
	it('says nothing for orders it should not describe', () => {
		expect(deliveryStatus(null)).toBeNull();
		expect(deliveryStatus({ ...base, isPaid: false })).toBeNull();
		expect(deliveryStatus({ ...base, isCancelled: true })).toBeNull();
		expect(deliveryStatus({ ...base, isDelivered: true })).toBeNull();
		expect(deliveryStatus({ ...base, isWalkIn: true })).toBeNull();
		expect(deliveryStatus({ ...base, orderType: 'PICKUP' })).toBeNull();
		expect(deliveryStatus({ ...base, orderType: 'DINE_IN' })).toBeNull();
	});

	it('says nothing while the food is still being cooked and nobody is involved yet', () => {
		expect(deliveryStatus({ ...base, kitchenStage: 'IN_PREPARATION' })).toBeNull();
		expect(deliveryStatus({ ...base, kitchenStage: 'RECEIVED' })).toBeNull();
	});

	it('is finding a partner once the food is ready and nobody has it', () => {
		expect(deliveryStatus(base).state).toBe('FINDING');
		expect(deliveryStatus({ ...base, kitchenStage: 'IN_PREPARATION', deliveryUnclaimedAt: '2026-10-15T10:00:00Z' }).state).toBe('FINDING');
	});

	it('names the partner and walks accepted -> on the way -> arrived', () => {
		const partner = { ...base, deliveryHandledBy: 'PARTNER', deliveryPartnerName: 'Swift Riders' };
		const assigned = deliveryStatus(partner);
		expect(assigned.state).toBe('ASSIGNED');
		expect(assigned.title).toBe('Swift Riders will deliver your order');

		const onTheWay = deliveryStatus({ ...partner, isShipped: true, kitchenStage: 'OUT_FOR_DELIVERY' });
		expect(onTheWay.state).toBe('ON_THE_WAY');
		expect(onTheWay.title).toBe('Swift Riders is on the way');

		const arrived = deliveryStatus({ ...partner, isShipped: true, deliveryArrivedAt: '2026-10-15T10:30:00Z' });
		expect(arrived.state).toBe('ARRIVED');
		expect(arrived.urgent).toBe(true);
		expect(arrived.text).toContain('delivery code');
	});

	it('uses a generic name when the partner has none (open-board courier)', () => {
		expect(deliveryStatus({ ...base, deliveryHandledBy: 'PARTNER' }).title).toBe('Your delivery partner will deliver your order');
	});

	it('is calm when the restaurant delivers itself', () => {
		const s = deliveryStatus({ ...base, deliveryHandledBy: 'SELF' });
		expect(s.state).toBe('SELF');
		expect(s.urgent).toBeUndefined();
	});

	it('only the arrived state is urgent', () => {
		const states = [
			deliveryStatus(base),
			deliveryStatus({ ...base, deliveryHandledBy: 'PARTNER' }),
			deliveryStatus({ ...base, deliveryHandledBy: 'PARTNER', isShipped: true }),
			deliveryStatus({ ...base, deliveryHandledBy: 'SELF' })
		];
		expect(states.every((s) => !s.urgent)).toBe(true);
	});

	it('tells the customer when the delivery failed at the door, even though the order is closed', () => {
		const s = deliveryStatus({ ...base, isDelivered: true, deliveryFailedAt: '2026-10-15T10:00:00Z' });
		expect(s).toMatchObject({ state: 'FAILED' });
		expect(s.text).toContain('not refunded');
		expect(deliveryStatus({ ...base, isDelivered: true, isCancelled: true, deliveryFailedAt: 'x' })).toBeNull();
	});
});
