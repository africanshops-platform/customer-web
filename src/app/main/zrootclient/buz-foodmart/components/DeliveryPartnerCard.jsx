import { motion } from 'framer-motion';
import { deliveryStatus } from './deliveryStatus';

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
	if (!status) return null;
	const c = PALETTE[status.state];

	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			aria-live="polite"
			aria-label="Delivery partner"
			data-testid={`delivery-${status.state.toLowerCase()}`}
			className="mb-6 flex items-center gap-4 rounded-2xl px-6 py-5 shadow-md"
			style={{ background: c.bg, border: `${status.urgent ? 2 : 1}px solid ${c.border}` }}
		>
			<motion.span
				className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow"
				animate={status.urgent ? { scale: [1, 1.12, 1] } : {}}
				transition={status.urgent ? { repeat: Infinity, duration: 1.6 } : {}}
			>
				{status.icon}
			</motion.span>
			<div>
				<h2 className="text-lg font-extrabold" style={{ color: c.accent }}>
					{status.title}
				</h2>
				<p className="mt-1 text-base text-gray-700">{status.text}</p>
			</div>
		</motion.section>
	);
}
