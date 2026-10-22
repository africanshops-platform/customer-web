import { useState } from "react";
import { Button, TextField } from "@mui/material";
import LocationPickerMap from "./LocationPickerMap";

const chip = (active) => ({
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "999px",
  borderColor: "#ea580c",
  color: active ? "#fff" : "#ea580c",
  bgcolor: active ? "#ea580c" : "transparent",
  "&:hover": { bgcolor: active ? "#c2410c" : "rgba(234,88,12,0.06)", borderColor: "#ea580c" },
});

/**
 * Where the food should be delivered: pick a saved address in one click, or choose a different one by pinning it on
 * the map (tap, drag, search, or "use my current location"). The pin is what prices the delivery from the restaurant.
 */
function DeliveryPointPanel({
  addresses = [],
  selectedAddressId,
  onPickSaved,
  onDifferentAddress,
  point,
  onPointChange,
  locating,
  onUseCurrentLocation,
  searchText,
  located,
  restaurant,
  distanceKm,
  canSave,
  saving,
  onSave,
}) {
  const [searching, setSearching] = useState(false);
  const [searchNote, setSearchNote] = useState("");
  const [saveLabel, setSaveLabel] = useState("Home");
  const [saveOpen, setSaveOpen] = useState(false);

  const search = async () => {
    const q = (searchText || "").trim();
    if (q.length < 4) {
      setSearchNote("Type your street address and landmark above first, then search.");
      return;
    }
    setSearching(true);
    setSearchNote("");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=ng`, {
        headers: { "Accept-Language": "en" },
      });
      const data = await res.json();
      if (data?.length) {
        onPointChange({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setSearchNote("Found it — drag the pin if it is not exactly at your door.");
      } else {
        setSearchNote("We could not find that address on the map — tap the map to place the pin yourself.");
      }
    } catch {
      setSearchNote("Search is unavailable right now — tap the map to place the pin yourself.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="delivery-point-panel">
      {/* saved addresses: one click fills everything */}
      <div>
        <p className="m-0 mb-2 text-sm font-semibold text-gray-700">Deliver to</p>
        <div className="flex flex-wrap gap-2">
          {addresses.map((a) => (
            <Button key={a.id} size="small" variant={selectedAddressId === a.id ? "contained" : "outlined"} sx={chip(selectedAddressId === a.id)} onClick={() => onPickSaved(a)} data-testid="saved-address-chip">
              {a.label || (a.isDefault ? "Home" : a.name)}
              {a.latitude != null ? " 📍" : ""}
            </Button>
          ))}
          <Button size="small" variant={!selectedAddressId ? "contained" : "outlined"} sx={chip(!selectedAddressId)} onClick={onDifferentAddress} data-testid="different-address-chip">
            {addresses.length ? "A different address" : "Enter an address"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outlined" onClick={onUseCurrentLocation} disabled={locating} data-testid="use-exact-location" sx={chip(false)}>
          {locating ? "Locating you…" : "📍 Use my current location"}
        </Button>
        <Button variant="outlined" onClick={search} disabled={searching} data-testid="find-on-map" sx={chip(false)}>
          {searching ? "Searching…" : "🔎 Find my address on the map"}
        </Button>
      </div>
      {searchNote && <p className="m-0 text-sm text-gray-600">{searchNote}</p>}

      <LocationPickerMap value={point} onChange={onPointChange} restaurant={restaurant} />
      {restaurant && (
        <p className="m-0 text-sm text-gray-700" data-testid="restaurant-distance">
          🍽️ <strong>{restaurant.name || "The restaurant"}</strong>
          {distanceKm != null ? ` is about ${Math.round(distanceKm)} km from your delivery point.` : " is shown on the map."}
          {restaurant.approximate ? " (The restaurant has not pinned its exact spot yet, so this uses its area.)" : ""}
        </p>
      )}

      <div className="rounded-xl p-4" style={{ background: point ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.10)", border: `1px solid ${point ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.3)"}` }} data-testid="delivery-point-status">
        {point ? (
          <>
            <p className="m-0 font-semibold text-gray-800 text-sm">Delivery point set</p>
            <p className="m-0 mt-1 text-xs text-gray-600">
              {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
              {located?.lga?.name ? ` · ${located.lga.name}, ${located.state?.name ?? ""}` : ""}
            </p>
            {located && located.confident === false && (
              <p className="m-0 mt-1 text-xs text-amber-700">This is far from the area centre we matched — please check Country, State and L.G.A below.</p>
            )}
            <p className="m-0 mt-1 text-xs text-gray-600">The delivery fee is measured from the restaurant to this exact point. Tap the map or drag the pin to adjust.</p>
          </>
        ) : (
          <>
            <p className="m-0 font-semibold text-gray-800 text-sm">No delivery point yet</p>
            <p className="m-0 mt-1 text-xs text-gray-600">Tap the map, search your address, or use your current location — we use it to fill in your area and work out the delivery fee.</p>
          </>
        )}
      </div>

      {canSave && point && (
        <div>
          {!saveOpen ? (
            <Button size="small" variant="text" onClick={() => setSaveOpen(true)} sx={{ textTransform: "none", color: "#ea580c", fontWeight: 600 }} data-testid="save-address-open">
              💾 Save this as one of my delivery addresses
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <TextField size="small" label="Name this address" value={saveLabel} onChange={(e) => setSaveLabel(e.target.value)} inputProps={{ maxLength: 40 }} />
              <Button variant="contained" disabled={saving || !saveLabel.trim()} onClick={() => onSave(saveLabel.trim())} sx={{ textTransform: "none", bgcolor: "#ea580c", "&:hover": { bgcolor: "#c2410c" } }} data-testid="save-address-confirm">
                {saving ? "Saving…" : "Save address"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DeliveryPointPanel;
