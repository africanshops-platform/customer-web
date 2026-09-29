// Canonical `key` values for LegalDocument — kept in sync BY HAND with
// LEGAL_DOCUMENT_KEYS / the LegalDocumentKey Prisma enum in
// africanshops-microservices (libs/interfaces/src/corporate-cms-dto/corporate-cms.dto.ts
// and apps/corporate-cms-service/prisma/schema.prisma), and mirrored the
// same way in admin-web's legalDocumentConstants.js and civic-web's own
// copy of this exact file. No shared package exists across these repos,
// so this is marketplace's copy — the backend is the source of truth.
// Fetching an unknown key gets a clean 400 from the API, not a silent miss.
export const LEGAL_DOCUMENT_KEYS = {
	PRIVACY_POLICY: 'PRIVACY_POLICY',
	TERMS_AND_CONDITIONS: 'TERMS_AND_CONDITIONS',
	DATA_SAFETY_POLICY: 'DATA_SAFETY_POLICY',
	COOKIE_POLICY: 'COOKIE_POLICY',
	REFUND_POLICY: 'REFUND_POLICY',
	RETURN_POLICY: 'RETURN_POLICY',
	SHIPPING_AND_DELIVERY_POLICY: 'SHIPPING_AND_DELIVERY_POLICY',
	MERCHANT_SELLER_AGREEMENT: 'MERCHANT_SELLER_AGREEMENT',
	ACCEPTABLE_USE_POLICY: 'ACCEPTABLE_USE_POLICY',
	DISPUTE_RESOLUTION_POLICY: 'DISPUTE_RESOLUTION_POLICY',
	BOOKING_CANCELLATION_POLICY: 'BOOKING_CANCELLATION_POLICY',
	KYC_AND_IDENTITY_VERIFICATION_POLICY: 'KYC_AND_IDENTITY_VERIFICATION_POLICY',
	COMMUNITY_GUIDELINES: 'COMMUNITY_GUIDELINES'
};
