import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Bin } from '../../types';

// Custom colored marker SVG
function createBinMarker(status: Bin['status']) {
  const colors = { empty: '#22c55e', medium: '#f59e0b', full: '#ef4444' };
  const color = colors[status];
  const svg = `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2"/>
      <circle cx="16" cy="16" r="8" fill="${color}"/>
      <path d="M16 28 L16 40" stroke="${color}" stroke-width="2"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

function FlyToUser() {
  const map = useMap();
  useEffect(() => {
    map.setView([12.9352, 77.6245], 12);
  }, []);
  return null;
}

interface BinMapProps {
  bins: Bin[];
  onBinClick?: (bin: Bin) => void;
}

const WASTE_COLORS: Record<string, string> = {
  plastic: '#3b82f6', organic: '#22c55e', metal: '#f59e0b', paper: '#a855f7',
};

export default function BinMap({ bins, onBinClick }: BinMapProps) {
  // Determine time of day for map theme
  const currentHour = new Date().getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18;
  
  const tileUrl = isDaytime 
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <MapContainer
        center={[12.9352, 77.6245]}
        zoom={12}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          url={tileUrl}
          attribution={attribution}
        />
        <FlyToUser />
        {bins.map(bin => (
          <Marker
            key={bin.id}
            position={[bin.location.lat, bin.location.lng]}
            icon={createBinMarker(bin.status)}
            eventHandlers={onBinClick ? { click: () => onBinClick(bin) } : {}}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{bin.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    bin.status === 'full' ? 'bg-red-500/20 text-red-400' :
                    bin.status === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-eco-500/20 text-eco-400'
                  }`}>
                    {bin.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[var(--color-text-secondary)] text-xs mb-3">{bin.address}</p>
                <div className="space-y-1.5">
                  {(['plastic', 'organic', 'metal', 'paper'] as const).map(type => {
                    const level = bin[`${type}Level` as keyof Bin] as number;
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-[var(--color-text-secondary)] text-xs w-14 capitalize">{type}</span>
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${level}%`, backgroundColor: WASTE_COLORS[type] }}
                          />
                        </div>
                        <span className="text-slate-300 text-xs w-8 text-right">{level}%</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[var(--color-text-secondary)] text-xs mt-2">{bin.residents.length} residents</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
