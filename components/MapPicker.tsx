'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapPickerProps {
  onConfirm: (lat: number, long: number) => void;
  onClose: () => void;
}

export default function MapPicker({ onConfirm, onClose }: MapPickerProps) {
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState<[number, number]>([20.0, 73.8]); // Default: India

  // Try to get user's rough location for better initial centering
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {} // silently fail, keep default
      );
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm slide-up">
      <div className="glass-frost rounded-3xl border border-white/10 shadow-2xl shadow-black/50 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Pick Location on Map
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tap on the map to place a pin</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Map */}
        <div className="h-64 sm:h-72 w-full">
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <ClickHandler onPick={(lat, lng) => setSelected({ lat, lng })} />
            {selected && <Marker position={[selected.lat, selected.lng]} icon={markerIcon} />}
          </MapContainer>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/8 flex items-center justify-between">
          {selected ? (
            <span className="text-xs text-green-300 font-mono">
              📍 {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
            </span>
          ) : (
            <span className="text-xs text-slate-500">No location selected</span>
          )}
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (selected) onConfirm(selected.lat, selected.lng);
            }}
            className="btn-primary px-5 py-2 text-xs font-bold rounded-xl disabled:opacity-40 transition-all"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
