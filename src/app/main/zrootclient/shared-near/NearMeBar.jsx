import { useState } from "react";
import { Button, Chip, CircularProgress, IconButton, InputAdornment, List, ListItemButton, ListItemText, Popover, TextField, Typography } from "@mui/material";
import { MyLocation, Search, Close } from "@mui/icons-material";
import { RADIUS_OPTIONS_KM, searchPlaces } from "./nearby";

/**
 * "Near me" controls shared by the customer-web listing pages (bookings first; real estate and food venues reuse it).
 * Mirrors customer-mobile's Nearby screen: My location, a radius (5/10/25/50 km, default 10), and "Change place" - a typed
 * address through the free OpenStreetMap Nominatim service. Country / State / LGA / District come from the page's own filter
 * list, which recentres the search on the chosen region's centre point.
 *
 * Props:
 *  - near:      null (off) | { point: {lat,lng}, label, source: "me" | "place" }
 *  - radiusKm:  current radius
 *  - status:    geolocation status from useUserLocation
 *  - total:     number of results in range (shown in the summary)
 *  - isLoading: results are being fetched
 *  - onUseMyLocation(), onPickPlace({ point, label, radiusKm }), onRadius(km), onClear()
 */
function NearMeBar({ near, radiusKm, status, total, isLoading, onUseMyLocation, onPickPlace, onRadius, onClear }) {
	const [anchor, setAnchor] = useState(null);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState(null);
	const [searching, setSearching] = useState(false);
	const [error, setError] = useState("");

	async function runSearch() {
		setError("");
		setSearching(true);
		try {
			const found = await searchPlaces(query);
			setResults(found);
			if (found.length === 0) setError("No match. Try a street, area or town, e.g. “Wuse 2, Abuja”.");
		} catch {
			setError("Address search is unavailable right now. Try the Country / State / LGA / District filters instead.");
		} finally {
			setSearching(false);
		}
	}

	function pick(r) {
		onPickPlace({ point: { lat: r.lat, lng: r.lng }, label: r.label, radiusKm: 5 });
		setAnchor(null);
		setResults(null);
		setQuery("");
	}

	const locating = status === "locating";
	const denied = status === "denied" || status === "unavailable";

	return (
		<div
			className="flex flex-wrap items-center gap-2 px-4 py-3 mb-4 rounded-xl"
			style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
			data-testid="near-me-bar"
		>
			<Button
				variant={near?.source === "me" ? "contained" : "outlined"}
				size="small"
				startIcon={locating ? <CircularProgress size={14} /> : <MyLocation />}
				onClick={onUseMyLocation}
				disabled={locating}
				sx={{ textTransform: "none", fontWeight: 700 }}
			>
				{near?.source === "me" ? "Near me" : "Use my location"}
			</Button>
			<Button
				variant={near?.source === "place" ? "contained" : "outlined"}
				size="small"
				startIcon={<Search />}
				onClick={(e) => setAnchor(e.currentTarget)}
				sx={{ textTransform: "none", fontWeight: 700 }}
			>
				{near?.source === "place" ? near.label : "Search a place"}
			</Button>

			{near && (
				<>
					{RADIUS_OPTIONS_KM.map((km) => (
						<Chip
							key={km}
							label={`${km} km`}
							size="small"
							color={radiusKm === km ? "warning" : "default"}
							variant={radiusKm === km ? "filled" : "outlined"}
							onClick={() => onRadius(km)}
						/>
					))}
					<Typography variant="caption" sx={{ color: "#92400e", ml: 1 }}>
						{isLoading ? "Searching…" : `${total} within ${radiusKm} km of ${near.source === "me" ? "you" : near.label}`}
					</Typography>
					<IconButton size="small" onClick={onClear} aria-label="Turn off near me" sx={{ ml: "auto" }}>
						<Close fontSize="small" />
					</IconButton>
				</>
			)}

			{denied && (
				<Typography variant="caption" sx={{ color: "#92400e", width: "100%" }}>
					Location is off in your browser, so near-me can’t use your position. Allow location for this site, or search a place or
					pick a region in the filters.
				</Typography>
			)}

			<Popover
				open={Boolean(anchor)}
				anchorEl={anchor}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
			>
				<div style={{ width: 340, padding: 16 }}>
					<TextField
						fullWidth
						size="small"
						autoFocus
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && query.trim().length >= 3 && runSearch()}
						placeholder="Street, area or town…"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Button size="small" onClick={runSearch} disabled={searching || query.trim().length < 3}>
										{searching ? <CircularProgress size={16} /> : "Search"}
									</Button>
								</InputAdornment>
							)
						}}
					/>
					{error && (
						<Typography variant="caption" sx={{ color: "#b91c1c", display: "block", mt: 1 }}>
							{error}
						</Typography>
					)}
					<List dense>
						{results?.map((r) => (
							<ListItemButton key={`${r.lat},${r.lng},${r.label}`} onClick={() => pick(r)}>
								<ListItemText primary={`📍 ${r.label}`} />
							</ListItemButton>
						))}
					</List>
					<Typography variant="caption" sx={{ color: "#6b7280" }}>
						Or choose a Country, State, LGA and District in the filters.
					</Typography>
				</div>
			</Popover>
		</div>
	);
}

export default NearMeBar;
