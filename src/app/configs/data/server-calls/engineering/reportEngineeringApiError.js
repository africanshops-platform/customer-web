import { toast } from 'react-toastify';

/**
 * Shared error-toast handler for the Engineering Services hooks (Phase E6c).
 * Mirrors the inline pattern repeated across useInspectionScheduleRepo.js,
 * pulled into one place here since this whole vertical is new — no existing
 * shared helper to retrofit, so no reason to repeat it four times ourselves.
 */
export default function reportEngineeringApiError(error, fallbackMessage) {
	const errorData = error?.response?.data;

	if (errorData?.message && Array.isArray(errorData.message)) {
		errorData.message.forEach((msg) => toast.error(msg));
		return;
	}

	if (errorData?.message && typeof errorData.message === 'string') {
		toast.error(errorData.message);
		return;
	}

	toast.error(error?.message || fallbackMessage);
}
