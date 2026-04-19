// @ts-nocheck
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Species = {
  name: string;
  status: string;
};

// FIX marker issue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapView({ species }: { species: Species[] }) {
  // Generate random positions once using useMemo to keep render pure
  const markers = React.useMemo(() => {
    return species.slice(0, 10).map((sp) => ({
      ...sp,
      lat: 20 + Math.random() * 10,
      lng: 78 + Math.random() * 10,
    }));
  }, [species]);

  return (
    <MapContainer center={[20.5937, 78.9629] as any} zoom={4} style={{ height: "400px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {markers.map((sp, i) => (
        <Marker key={i} position={[sp.lat, sp.lng]}>
          <Popup>
            <b>{sp.name}</b><br />
            {sp.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}