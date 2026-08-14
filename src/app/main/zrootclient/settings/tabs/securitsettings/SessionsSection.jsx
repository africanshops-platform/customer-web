import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { formatDistanceToNow } from "date-fns";
import { useSessions, useRevokeSession } from "app/configs/data/server-calls/useSessions/useSessionsQuery";

function deviceIcon(deviceName) {
	const d = deviceName?.toLowerCase() ?? "";
	if (d.includes("iphone") || d.includes("ios") || d.includes("android")) return "heroicons-solid:device-mobile";
	if (d.includes("mac") || d.includes("ipad")) return "heroicons-solid:device-tablet";
	return "heroicons-solid:desktop-computer";
}

function formatLastActive(dateString) {
	try {
		return formatDistanceToNow(new Date(dateString), { addSuffix: true });
	} catch {
		return "recently";
	}
}

function SessionRow({ session, onRevoke, isRevoking }) {
	return (
		<div
			className="flex items-center justify-between gap-3 p-4 rounded-xl"
			style={{
				background: session.isCurrent ? "rgba(34, 197, 94, 0.05)" : "rgba(249, 250, 251, 1)",
				border: session.isCurrent ? "2px solid rgba(34, 197, 94, 0.2)" : "2px solid rgba(229, 231, 235, 1)"
			}}
		>
			<div className="flex items-center gap-3 min-w-0">
				<div
					className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
						session.isCurrent ? "bg-green-100" : "bg-gray-100"
					}`}
				>
					<FuseSvgIcon size={20} className={session.isCurrent ? "text-green-600" : "text-gray-600"}>
						{deviceIcon(session.deviceName)}
					</FuseSvgIcon>
				</div>
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<Typography className="text-sm font-semibold text-gray-800 truncate">
							{session.deviceName || "Unknown device"}
						</Typography>
						{session.isCurrent && (
							<span className="text-[10px] font-bold text-white bg-green-500 rounded-full px-2 py-0.5 flex-shrink-0">
								This device
							</span>
						)}
					</div>
					<Typography className="text-xs text-gray-500 truncate">
						{session.ipAddress || "Unknown IP"} · Active {formatLastActive(session.lastActiveAt)}
					</Typography>
				</div>
			</div>

			{!session.isCurrent && (
				<Button
					size="small"
					onClick={() => onRevoke(session.sessionId)}
					disabled={isRevoking}
					sx={{
						color: "#dc2626",
						backgroundColor: "#fef2f2",
						border: "1px solid #fecaca",
						minWidth: 84,
						flexShrink: 0,
						"&:hover": { backgroundColor: "#fee2e2" }
					}}
				>
					{isRevoking ? <CircularProgress size={16} sx={{ color: "#dc2626" }} /> : "Sign out"}
				</Button>
			)}
		</div>
	);
}

/**
 * Active-sessions/devices list for the user's own Security settings -- lets them
 * see every device signed into their account and revoke individually or in bulk.
 * Mirrors the same UX already shipped on user-app/civic-app mobile.
 */
function SessionsSection() {
	const { data: sessions, isLoading } = useSessions();
	const revokeSession = useRevokeSession();

	const otherSessions = (sessions ?? []).filter((s) => !s.isCurrent);
	const currentSession = (sessions ?? []).find((s) => s.isCurrent);

	function handleRevokeAllOthers() {
		if (!window.confirm(`Sign out ${otherSessions.length} other device${otherSessions.length === 1 ? "" : "s"}?`)) {
			return;
		}

		otherSessions.forEach((s) => revokeSession.mutate(s.sessionId));
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.3 }}
			className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6"
			style={{ border: "2px solid rgba(234, 88, 12, 0.1)" }}
		>
			<div className="flex items-center justify-between gap-3 mb-6">
				<div className="flex items-center gap-3">
					<div
						className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
						style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
					>
						<FuseSvgIcon className="text-white" size={24}>
							heroicons-solid:device-mobile
						</FuseSvgIcon>
					</div>
					<div>
						<Typography className="text-xl font-bold text-gray-800">Active Sessions</Typography>
						<Typography className="text-sm text-gray-600">
							{sessions ? `${sessions.length} device${sessions.length === 1 ? "" : "s"} signed in` : "Devices signed into your account"}
						</Typography>
					</div>
				</div>

				{otherSessions.length > 0 && (
					<Button
						size="small"
						onClick={handleRevokeAllOthers}
						sx={{
							color: "#dc2626",
							backgroundColor: "#fef2f2",
							border: "1px solid #fecaca",
							flexShrink: 0,
							"&:hover": { backgroundColor: "#fee2e2" }
						}}
					>
						Sign out all others
					</Button>
				)}
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<CircularProgress size={28} sx={{ color: "#f97316" }} />
				</div>
			) : (
				<div className="grid gap-3">
					{currentSession && (
						<SessionRow session={currentSession} onRevoke={undefined} isRevoking={false} />
					)}
					{otherSessions.map((session) => (
						<SessionRow
							key={session.sessionId}
							session={session}
							onRevoke={(id) => revokeSession.mutate(id)}
							isRevoking={revokeSession.isLoading && revokeSession.variables === session.sessionId}
						/>
					))}
					{!sessions?.length && (
						<Typography className="text-sm text-gray-500 text-center py-4">
							No session data available.
						</Typography>
					)}
				</div>
			)}
		</motion.div>
	);
}

export default SessionsSection;
