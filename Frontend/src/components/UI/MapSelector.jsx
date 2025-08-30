import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Create a custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// MapEvents component to handle click events
function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
}

const MapSelector = ({ coordinates, onLocationSelect }) => {
  // Default center to Mumbai if no coordinates selected
  const center =
    coordinates.lat && coordinates.lng
      ? [coordinates.lat, coordinates.lng]
      : [19.076, 72.8777];

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates.lat && coordinates.lng && (
          <Marker
            position={[coordinates.lat, coordinates.lng]}
            icon={customIcon}
          />
        )}
        <MapEvents onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
};

export default MapSelector;
