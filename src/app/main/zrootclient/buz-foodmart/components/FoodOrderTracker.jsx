import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { STAGE_COPY, TRACK_LABEL, currentStage, stageFlow, timeLeft } from './kitchenFlow';

const fmt = (iso) =>
	iso ? new Date(iso).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

/**
 * The customer's live view of their food order. Which steps appear depends on how the food is made:
 * ready-now dishes are short, made-to-order dishes show the kitchen, and chef-booked dishes show the whole
 * journey including the market run. The chef's own notes appear in the activity feed.
 */
function FoodOrderTracker({ order }) {
	const [now, setNow] = useState(Date.now());
	useEffect(() => {
		const t = setInterval(() => setNow(Date.now()), 30000);
		return () => clearInterval(t);
	}, []);

	const track = order?.track || 'INSTANT';
	const stage = currentStage(order);
	const declined = stage === 'DECLINED';
	const flow = stageFlow(track, order?.orderType);
	const active = flow.indexOf(stage);
	const copy = STAGE_COPY[stage] || STAGE_COPY.RECEIVED;

	const promise = (() => {
		if (declined || stage === 'DELIVERED') return null;
		if (stage === 'AWAITING_ACCEPTANCE' && order?.acceptByAt) {
			const t = timeLeft(order.acceptByAt, now);
			return t ? `The chef will confirm within ${t}` : 'The chef is taking a little longer than expected — you will be refunded automatically if this is not accepted.';
		}
		if (track === 'COOK_TO_ORDER' && order?.deliverByAt) return `Chef is delivering by ${fmt(order.deliverByAt)}`;
		if (track === 'A_LA_CARTE' && order?.promisedReadyAt) {
			const t = timeLeft(order.promisedReadyAt, now);
			return t ? `Ready in about ${t}` : 'Should be ready any moment';
		}
		return null;
	})();

	const feed = [...(order?.kitchenTimeline || [])].reverse();

	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.05 }}
			aria-label="Order tracking"
			className="mb-6 overflow-hidden rounded-2xl bg-white shadow-md"
			style={{ border: `1px solid ${declined ? '#fca5a5' : 'rgba(229,231,235,1)'}` }}
		>
			<div
				className="px-6 py-5"
				style={{ background: declined ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : 'linear-gradient(135deg,#fff7ed,#ffedd5)' }}
			>
				<div className="flex flex-wrap items-center gap-3">
					<span className="rounded-full bg-white px-3 py-1 text-sm font-bold" style={{ color: '#c2410c' }}>
						{TRACK_LABEL[track]}
					</span>
					<h2 className="text-xl font-extrabold text-gray-900">{copy.label}</h2>
				</div>
				<p className="mt-2 text-base text-gray-700">{copy.says}</p>
				{order?.declinedReason && <p className="mt-1 text-base text-gray-700">Chef&apos;s note: {order.declinedReason}</p>}
				{promise && <p className="mt-3 text-base font-bold" style={{ color: '#c2410c' }}>{promise}</p>}
			</div>

			{!declined && (
				<ol className="m-0 flex list-none flex-wrap gap-y-4 px-6 py-5">
					{flow.map((s, i) => {
						const done = i < active || stage === 'DELIVERED';
						const current = i === active && stage !== 'DELIVERED';
						return (
							<li key={s} className="flex min-w-[96px] flex-1 flex-col items-center text-center" aria-current={current ? 'step' : undefined}>
								<span
									className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-base font-bold"
									style={{
										background: done || current ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'rgba(229,231,235,1)',
										color: done || current ? '#fff' : '#9ca3af',
										boxShadow: current ? '0 0 0 6px rgba(249,115,22,0.18)' : 'none'
									}}
								>
									{done ? '✓' : i + 1}
								</span>
								<span className="text-sm font-semibold leading-tight" style={{ color: done || current ? '#c2410c' : '#9ca3af' }}>
									{STAGE_COPY[s].label}
								</span>
							</li>
						);
					})}
				</ol>
			)}

			{feed.length > 0 && (
				<div className="border-t px-6 py-5" style={{ borderColor: 'rgba(229,231,235,1)' }}>
					<h3 className="mb-3 text-base font-bold text-gray-900">Activity</h3>
					<ol className="m-0 list-none p-0">
						{feed.map((e, i) => (
							<li key={`${e.stage}-${e.at}-${i}`} className="mb-3 flex gap-3">
								<span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: i === 0 ? '#ea580c' : '#d1d5db' }} />
								<span className="text-base text-gray-800">
									<span className="font-semibold">{STAGE_COPY[e.stage]?.label || e.stage}</span>
									<span className="ml-2 text-sm text-gray-500">{fmt(e.at)}</span>
									{e.note && <span className="block text-gray-600">{e.note}</span>}
								</span>
							</li>
						))}
					</ol>
				</div>
			)}
		</motion.section>
	);
}

export default FoodOrderTracker;
