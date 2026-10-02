import { useState } from "react";
import { toast } from "react-toastify";
import { getNearestMarketsApi } from "app/configs/data/client/clientToApiRoutes";

/**
 * "Use my nearest pickup point": asks the browser for the device location, has the server rank operational
 * markets by distance, and hands the closest one back as { country, state, lga, market } ids.
 * Never throws — a denied permission or an offline lookup just shows a message and leaves the form alone.
 */
export default function useNearestPickup(onPick) {
  const [locating, setLocating] = useState(false);

  const locate = () => {
    if (!navigator.geolocation) {
      toast.info("This device can't share its location — choose your pickup point from the lists.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await getNearestMarketsApi(pos.coords.latitude, pos.coords.longitude, 1);
          const nearest = res?.data?.markets?.[0];
          if (!nearest) {
            toast.info("No pickup point found near you — choose one from the lists.");
          } else {
            await onPick(
              { country: nearest.businesscountry, state: nearest.businezstate, lga: nearest.businezLga, market: nearest.id },
              nearest,
            );
            toast.success(`Nearest pickup point: ${nearest.name} (${nearest.distanceKm} km away)`);
          }
        } catch {
          toast.error("Couldn't find your nearest pickup point. Please choose one from the lists.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.info("Location permission was declined — choose your pickup point from the lists.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  return { locate, locating };
}
