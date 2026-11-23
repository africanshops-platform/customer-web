// What the card was actually charged, for receipts and order pages. The order stores only what it is worth (items + shipping + VAT); when the customer pays
// the payment gateway fee on top, the card is charged more than the order total, and a screen that says "Total paid" must match the bank statement (found
// 23 Nov 2026: order total N124,413.00, card charged N126,409.14). The charge is Paystack's own amount in kobo (the stored payment record); the fee is
// the difference. Anything that does not look right (no amount, a charge below the order, a "fee" over 10 percent of the order) returns null and the screen
// keeps the order total: never an invented figure. Same rules as the confirmation email (zones-notification-service util/payment-summary.ts).

export function paymentSummary(orderTotalNaira, ...paymentRecords) {
	const total = Number(orderTotalNaira);

	if (!Number.isFinite(total) || total <= 0) return null;

	for (const record of paymentRecords) {
		const kobo = Number(record?.amount);

		if (!Number.isFinite(kobo) || kobo <= 0) continue;

		const chargedNaira = Math.round(kobo) / 100;
		const gatewayFeeNaira = Math.round((chargedNaira - total) * 100) / 100;

		if (gatewayFeeNaira < 0 || gatewayFeeNaira > total * 0.1) return null;

		return { chargedNaira, gatewayFeeNaira };
	}

	return null;
}
