import { AUTHENTICATOR_APPS, PASSWORD_MANAGER_NOTE } from '../authenticatorApps';

describe('authenticatorApps', () => {
	it('lists the well-known apps by name, each with a short note, with no duplicates', () => {
		const names = AUTHENTICATOR_APPS.map((a) => a.name);

		expect(names).toEqual(expect.arrayContaining(['Google Authenticator', 'Microsoft Authenticator', 'Authy']));
		expect(new Set(names).size).toBe(names.length);
		AUTHENTICATOR_APPS.forEach((a) => {
			expect(a.name.trim()).not.toBe('');
			expect(a.note.trim()).not.toBe('');
		});
	});

	it('mentions password managers, and carries no store links that could go stale', () => {
		expect(PASSWORD_MANAGER_NOTE).toMatch(/1Password|Bitwarden/);
		expect(JSON.stringify(AUTHENTICATOR_APPS)).not.toMatch(/https?:/);
	});
});
