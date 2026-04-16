'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import type { Report } from '@/lib/types';
import { STATUS_COLORS } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface IncidentMapProps {
  reports: Report[];
}

function HeatmapLayer({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    if (!reports || reports.length === 0) return;
    
    const heatData = reports.map((r) => [
      r.lat,
      r.long,
      r.status === 'Resolved' ? 0.3 : 1, // Intensity
    ] as L.HeatLatLngTuple);


    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.0: 'rgba(0,0,0,0)',
        0.4: 'rgba(34,197,94,0.8)', // Green (Resolved)
        0.6: 'rgba(234,179,8,1)', // Yellow (In Progress)
        0.8: 'rgba(249,115,22,1)', // Orange
        1.0: 'rgba(239,68,68,1)', // Red (Pending/Rejected)
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, reports]);

  return null;
}

const createCustomIcon = (statusColor: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${statusColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export default function IncidentMap({ reports }: IncidentMapProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Center map on first report or default
  const center: L.LatLngExpression =
    reports.length > 0
      ? [reports[0].lat, reports[0].long]
      : [20.5937, 78.9629];

  return (
    <div className="relative w-full h-full p-0 m-0">
      {/* Heatmap toggle */}
      <div className="absolute top-4 left-4 z-[500] flex gap-2">
        <button
          onClick={() => setShowHeatmap((v) => !v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-lg ${
            showHeatmap
              ? 'bg-blue-500/80 border-blue-500/40 text-white'
              : 'bg-slate-800/80 border-slate-700/50 text-slate-400'
          }`}
        >
          {showHeatmap ? '🌡 Heatmap ON' : '🌡 Heatmap OFF'}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-[500] glass px-3 py-2 rounded-xl text-xs space-y-1.5 shadow-lg">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: color, border: '1px solid rgba(255,255,255,0.2)' }} />
            <span className="text-slate-300 font-medium">{status}</span>
          </div>
        ))}
      </div>

      <MapContainer
        center={center}
        zoom={reports.length > 0 ? 12 : 5}
        zoomControl={true}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        {/* CartoDB Dark Matter */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {showHeatmap && <HeatmapLayer reports={reports} />}

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.lat, report.long]}
            icon={createCustomIcon(STATUS_COLORS[report.status])}
          >
            <Popup
              offset={[0, -7]}
            >
              <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 260, minWidth: 220, padding: 0 }}>
                {report.image_url && (
                  <div style={{ position: 'relative', width: '100%', height: 130, marginBottom: 8, borderRadius: 6, overflow: 'hidden' }}>
                    <Image
                      src={report.image_url}
                      alt="Incident"
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {report.category}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                    background: report.status === 'Resolved' ? 'rgba(34,197,94,0.15)' : report.status === 'Pending' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: report.status === 'Resolved' ? '#15803d' : report.status === 'Pending' ? '#b91c1c' : '#b45309',
                    border: `1px solid ${report.status === 'Resolved' ? 'rgba(34,197,94,0.3)' : report.status === 'Pending' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`
                  }}>
                    {report.status}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#334155', margin: '0 0 6px 0', lineHeight: 1.4, fontWeight: 500 }}>
                  {report.description}
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
