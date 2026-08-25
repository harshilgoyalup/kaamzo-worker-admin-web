export interface GpsLocation {
  lat: number;
  lng: number;
  address: string;
}

export async function getCurrentLocationWithAddress(): Promise<GpsLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en-US,en;q=0.9",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const displayName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            resolve({
              lat,
              lng,
              address: displayName,
            });
            return;
          }
        } catch (err) {
          console.warn("Nominatim reverse geocoding failed, using coordinates", err);
        }

        resolve({
          lat,
          lng,
          address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        });
      },
      (error) => {
        let msg = "Failed to get current location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location access was denied. Please allow location permissions.";
        }
        reject(new Error(msg));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

export async function searchAddressOSM(query: string): Promise<Array<{ label: string; lat: number; lng: number }>> {
  if (!query || query.length < 3) return [];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => ({
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (err) {
    console.error("OSM address search error:", err);
    return [];
  }
}
