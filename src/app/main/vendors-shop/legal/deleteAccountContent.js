/**
 * The public "delete your account" page (https://www.africanshops.org/delete-account).
 *
 * Google Play asks every app that lets people create an account for a web address where a person can request
 * deletion of their account and data without having to sign in first, so this page is static text rather than a
 * keyed legal document: it needs no login, no API call and no schema change. It is rendered by LegalDocumentPage
 * through its `staticDocument` prop and must keep saying what the Privacy Policy (sections 9 and 10) says.
 */
export const DELETE_ACCOUNT_DOCUMENT = {
	title: 'Delete your AfricanShops account and data',
	updatedAt: '2026-11-06T00:00:00.000Z',
	content: `AfricanShops is operated by **SCANAFRIQUE LTD**. This page explains how to delete your account in any AfricanShops app (the AfricanShops customer app, the AfricanShops Merchant app and the AfricanShops Civic app, and their websites), and what happens to your data when you do.

## Delete your account yourself

Sign in, then open the security settings and choose **Close Account**:

- **AfricanShops customer app:** Profile, then Security, then Close Account. On the website: Settings, then Security, then Close Account.
- **AfricanShops Civic app:** Profile, then Security, then Close Account. On the website: Settings, then Security, then Close Account.
- **AfricanShops Merchant app and dashboard:** Settings, then Security, then Close Account. You confirm with your account email.

You will be asked to confirm with your password or your account email. Closing an account takes effect immediately and cannot be undone.

## If you cannot sign in

Email **hello@scanafrique.com** from the email address that is on your account, with the subject "Delete my account". We will check that the request really comes from you, and complete the deletion within 30 days of verifying your identity.

## What is deleted

- Your login details and profile: name, email, phone number, addresses and preferences.
- Your biometric identity data (the facial recognition descriptor and registered device credentials), immediately or within 30 days at the latest.
- Your reviews, messages and saved items.
- Your posts, statuses, reactions and reports: removed from public view and deleted or irreversibly anonymised.
- Merchant accounts are deactivated and the storefront is taken down straight away. We keep the underlying business record in a closed state because it links to order and payout history that other users still need to see.

## What we keep, and why

- **Financial and transaction records** (payments, escrow, settlements, wallet entries) are kept for at least 5 years after the transaction.
- **Identity verification (KYC) records** are kept for at least 5 years after your account is closed.

Nigerian law requires us to keep these, so we cannot remove them on request. We keep them separate from everyday systems, restrict who can see them, and use them only for those legal purposes.

**After your account is closed we keep no personal data for marketing.** The only other thing that may remain is anonymised, aggregated information (for example, totals of orders by area) from which no individual can be identified.

## Before you delete

- Withdraw your wallet balance and complete or cancel any open orders. Deleting an account does not settle an order, a dispute or a balance for you, and we may need to keep the account open until they are settled.
- Closing your account does not reverse payments you have already made.

## Other requests about your data

You can also ask us to give you a copy of your data, correct it, or stop using it for marketing, at any time. Write to **hello@scanafrique.com**. You can read how we handle your data in our [Privacy Policy](/privacy), and you may complain to the Nigeria Data Protection Commission (NDPC).
`
};
