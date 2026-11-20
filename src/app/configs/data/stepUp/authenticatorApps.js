/**
 * Authenticator apps a person can use. Any app that makes standard time-based 6-digit codes (TOTP) works with AfricanShops; these are the
 * well-known ones, so nobody has to guess. Names only: people find them by searching the App Store or Google Play (no store links to go stale).
 */
export const AUTHENTICATOR_APPS = [
	{ name: 'Google Authenticator', note: 'Free. The simplest choice.' },
	{ name: 'Microsoft Authenticator', note: 'Free. Can back up your codes to your Microsoft account.' },
	{ name: 'Authy', note: 'Free. Keeps an encrypted backup so a new phone is easy.' },
	{ name: '2FAS Authenticator', note: 'Free and open source.' }
];

export const PASSWORD_MANAGER_NOTE = 'Already use 1Password or Bitwarden? Their built-in authenticator works too.';
