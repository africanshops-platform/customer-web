import { AUTHENTICATOR_APPS, PASSWORD_MANAGER_NOTE } from './authenticatorApps';

/** What to install and what to do, shown above the QR code so a first-time user is never stuck. */
export default function AuthenticatorAppHelp({ textColor, mutedColor, accentSoft }) {
	return (
		<div style={{ marginBottom: 16 }}>
			<div style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 6 }}>1. Get an authenticator app (free)</div>
			<div style={{ fontSize: 13, color: mutedColor, marginBottom: 8 }}>
				Install one on your phone: search for its name in the App Store or Google Play. Any app that makes 6-digit codes works.
			</div>
			<div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
				{AUTHENTICATOR_APPS.map((app) => (
					<div
						key={app.name}
						style={{ background: accentSoft, borderRadius: 10, padding: '8px 12px', fontSize: 13, color: textColor }}
					>
						<b>{app.name}</b>
						<span style={{ color: mutedColor }}> — {app.note}</span>
					</div>
				))}
			</div>
			<div style={{ fontSize: 12.5, color: mutedColor, marginBottom: 14 }}>{PASSWORD_MANAGER_NOTE}</div>
			<div style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 4 }}>2. Add AfricanShops</div>
			<div style={{ fontSize: 13, color: mutedColor, marginBottom: 14 }}>
				Open the app, tap Add (+), choose Scan a QR code and scan the picture below. Cannot scan? Choose Enter a setup key and type the key under the picture.
			</div>
			<div style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 4 }}>3. Type the 6-digit code</div>
			<div style={{ fontSize: 13, color: mutedColor }}>The app now shows a code that changes every 30 seconds. Type the current one below, or paste it.</div>
		</div>
	);
}
