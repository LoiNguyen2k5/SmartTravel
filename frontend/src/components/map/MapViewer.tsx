import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewerProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: number;
    lat: number;
    lng: number;
    title: string;
  }>;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  center = [10.762622, 106.660172], // Default TP.HCM coordinates
  zoom = 12,
  markers = [],
}) => {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner min-h-[400px]">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>{m.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
