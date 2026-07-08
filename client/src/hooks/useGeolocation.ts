import { useEffect, useState } from "react";

type GeolocationPosition = {
  lat: number;
  lng: number;
};

type UseGeolocationResult = {
  position: GeolocationPosition | null;
  loading: boolean;
  error: string | null;
};

function getGeolocationErrorMessage(error: globalThis.GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied";
    case error.POSITION_UNAVAILABLE:
      return "Location is unavailable";
    case error.TIMEOUT:
      return "Location request timed out";
    default:
      return "Failed to get current location";
  }
}

export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        setPosition({
          lat: currentPosition.coords.latitude,
          lng: currentPosition.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (geolocationError) => {
        setError(getGeolocationErrorMessage(geolocationError));
        setLoading(false);
      },
    );
  }, []);

  return { position, loading, error };
}
