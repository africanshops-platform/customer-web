import { Circle, CircleMarker, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Typography } from "@mui/material";
import { distanceLabel, priceChip } from "./nearby";

/**
 * Map pieces shared by the customer-web listing maps (bookings, real estate, food venues) so they look and behave like
 * customer-mobile's Nearby map (tracker customer-22): orange price chips, one blue count marker for listings at the same
 * spot, the search-point dot and the radius circle.
 */

/** Orange price-chip marker. The text is a number-derived chip, never raw HTML. */
export function chipIcon(price) {
	const chip = priceChip(price);
	return L.divIcon({
		className: "",
		html: `<div style="display:inline-block;transform:translate(-50%,-100%);background:#f97316;color:#fff;font:700 12px sans-serif;padding:5px 9px;border-radius:999px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);white-space:nowrap">${chip || "•"}</div>`,
		iconSize: [0, 0]
	});
}

/** Blue count marker for several listings at one spot. */
export function stackIcon(count) {
	return L.divIcon({
		className: "",
		html: `<div style="display:inline-block;transform:translate(-50%,-100%);min-width:24px;text-align:center;background:#2563eb;color:#fff;font:700 12px sans-serif;padding:5px 9px;border-radius:999px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)">${Number(count)}</div>`,
		iconSize: [0, 0]
	});
}

/** Radius circle, search-point dot and (when different) the visitor's own position. */
export function NearbyOverlays({ near, radiusKm, userPoint }) {
	return (
		<>
			{near?.point && radiusKm ? (
				<Circle
					center={[near.point.lat, near.point.lng]}
					radius={radiusKm * 1000}
					pathOptions={{ color: "#f97316", weight: 1, fillColor: "#f97316", fillOpacity: 0.05 }}
					interactive={false}
				/>
			) : null}
			{near?.point ? (
				<CircleMarker
					center={[near.point.lat, near.point.lng]}
					radius={7}
					pathOptions={{ color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }}
					interactive={false}
				/>
			) : null}
			{userPoint && near?.source === "place" ? (
				<CircleMarker
					center={[userPoint.lat, userPoint.lng]}
					radius={5}
					pathOptions={{ color: "#fff", weight: 2, fillColor: "#16a34a", fillOpacity: 1 }}
					interactive={false}
				/>
			) : null}
		</>
	);
}

/**
 * One count marker per spot with several listings; its popup lists the first six with a link each.
 * stacks: [{ lat, lng, items }] (from groupByLocation); linkFor(item) -> route; priceText(item) -> "₦30,000".
 */
export function StackMarkers({ stacks, linkFor, priceText }) {
	return stacks.map((g) => (
		<Marker key={`stack-${g.lat}-${g.lng}`} position={[g.lat, g.lng]} icon={stackIcon(g.items.length)}>
			<Popup maxWidth={340} className="custom-popup">
				<div className="flex flex-col gap-2 p-4">
					<Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827" }}>{g.items.length} listings at this spot</Typography>
					{g.items.slice(0, 6).map((it) => (
						<Typography
							key={it?._id || it?.id}
							component={NavLinkAdapter}
							to={linkFor(it)}
							sx={{ fontSize: "0.95rem", color: "#ea580c", fontWeight: 600 }}
						>
							{it?.title}
							{priceText(it) ? ` · ${priceText(it)}` : ""}
							{distanceLabel(it?.distanceKm) ? ` · ${distanceLabel(it.distanceKm)}` : ""}
						</Typography>
					))}
					{g.items.length > 6 && (
						<Typography sx={{ fontSize: "0.85rem", color: "#6b7280" }}>+ {g.items.length - 6} more — see the list</Typography>
					)}
				</div>
			</Popup>
		</Marker>
	));
}
