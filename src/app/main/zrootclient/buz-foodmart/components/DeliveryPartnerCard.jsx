import { motion } from 'framer-motion';
import { useFoodDeliveryLive } from 'app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo';
import { deliveryStatus } from './deliveryStatus';
import { riderEtaLabel, riderTelUrl, toPoint } from './deliveryLive';
import RiderMap from './RiderMap';

const PALETTE = {
	ARRIVED: { bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', border: '#4ade80', accent: '#15803d' },
	ON_THE_WAY: { bg: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '#fdba74', accent: '#c2410c' },
	ASSIGNED: { bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#93c5fd', accent: '#1d4ed8' },
	SELF: { bg: 'linear-gradient(135deg,#f9fafb,#f3f4f6)', border: '#e5e7eb', accent: '#374151' },
	FINDING: { bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '#fcd34d', accent: '#92400e' }
};

/**
 * Who is delivering the customer's food and where they are: finding a partner, on the way to the restaurant, on the way
 * to you, or outside. The "arrived" state is the loudest because the customer must act (give the code).
 */
export default function DeliveryPartnerCard({ order }) {
	const status = deliveryStatus(order);
	const watching = status && ['ASSIGNED', 'ON_THE_WAY', 'ARRIVED'].includes(status.state);
	// Phone and rider position come from the live view (never cached); it only returns data while the delivery is active.
	const liveRes = useFoodDeliveryLive(order?.id || order?._id, watching);
	if (!status) return null;
	const c = PALETTE[status.state];
	const live = liveRes.data?.data?.live;
	const tel = riderTelUrl(live?.partnerPhone);
	const rider = toPoint(live?.rider?.lat, live?.rider?.lng);
	const destination = toPoint(live?.destination?.lat, live?.destination?.lng);
	const eta = riderEtaLabel(rider, destination);
	const showMap = Boolean(rider);

	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			aria-live="polite"
			aria-label="Delivery partner"
			data-testid={`delivery-${status.state.toLowerCase()}`}
			className="mb-6 overflow-hidden rounded-2xl shadow-md"
			style={{ background: c.bg, border: `${status.urgent ? 2 : 1}px solid ${c.border}` }}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
			<motion.span
				style={{ width: 56, height: 56, minWidth: 56, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
				animate={status.urgent ? { scale: [1, 1.12, 1] } : {}}
				transition={status.urgent ? { repeat: Infinity, duration: 1.6 } : {}}
			>
				{status.icon}
			</motion.span>
			<div className="flex-1">
				<h2 className="text-lg font-extrabold" style={{ color: c.accent }}>
					{status.title}
				</h2>
				<p className="mt-1 text-base text-gray-700">{status.text}</p>
				{eta && showMap && status.state !== 'ARRIVED' && (
					<p className="mt-1 text-base font-bold" style={{ color: c.accent }} data-testid="rider-eta">
						{eta}
					</p>
				)}
			</div>
			{tel && (
				<a
					href={tel}
					data-testid="call-rider"
					style={{ background: 'linear-gradient(135deg,#f97316,#c2410c)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16, padding: '12px 20px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 8px rgba(194,65,12,0.35)' }}
				>
					📞 Call rider
				</a>
			)}
			</div>
			{showMap && (
				<div style={{ padding: '0 24px 20px' }}>
					<RiderMap destination={destination} rider={rider} />
				</div>
			)}
		</motion.section>
	);
}
