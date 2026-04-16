'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix the default marker icon issue in Next.js/webpack
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMiniMapProps {
  lat: number;
  long: number;
}

export default function LocationMiniMap({ lat, long }: LocationMiniMapProps) {
  return (
    <MapContainer
      center={[lat, long]}
      zoom={15}
      scrollWheelZoom={false}
      zoomControl={true}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, long]} icon={markerIcon}>
        <Popup>
          <span className="font-mono text-xs">
            {lat.toFixed(6)}, {long.toFixed(6)}
          </span>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
