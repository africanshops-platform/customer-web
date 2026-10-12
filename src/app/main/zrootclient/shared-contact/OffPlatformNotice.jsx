import { PLATFORM_TRADE_WARNING } from "./platformContact";

/** The warning shown beside every call-the-seller action. */
function OffPlatformNotice({ className = "" }) {
	return (
		<p
			className={`text-gray-500 ${className}`}
			style={{ fontSize: "1.2rem", lineHeight: 1.4 }}
			role="note"
			data-testid="off-platform-notice"
		>
			⚠️ {PLATFORM_TRADE_WARNING}
		</p>
	);
}

export default OffPlatformNotice;
