import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RoutePoint {
  id: number;
  lat: number;
  lng: number;
  title: string;
  day?: number;
}

interface RouteInteractiveMapProps {
  points: RoutePoint[];
  center?: [number, number];
  zoom?: number;
  showRoute?: boolean;
}

export const RouteInteractiveMap: React.FC<RouteInteractiveMapProps> = ({
  points,
  center = [16.054407, 108.202167],
  zoom = 10,
  showRoute = true,
}) => {
  const polylinePositions: [number, number][] = points.map((p) => [p.lat, p.lng]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 min-h-[400px]">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((point, idx) => (
          <Marker key={point.id} position={[point.lat, point.lng]}>
            <Popup>
              <div>
                <strong>Điểm {idx + 1}: {point.title}</strong>
                {point.day && <p>Ngày {point.day}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
        {showRoute && points.length >= 2 && (
          <Polyline positions={polylinePositions} color="#0ea5e9" weight={3} dashArray="6 4" />
        )}
      </MapContainer>
    </div>
  );
};
