// RouteMap: zeigt die Zwischenpunkte einer Transport_Route auf einer Leaflet-
// Karte als Punkte (CircleMarker) und verbindet sie in Reihenfolge mit einer
// Linie (Polyline). Die Koordinaten stammen aus den gemockten Daten
// (coordinateForId). CircleMarker statt Bild-Icons vermeidet das bekannte
// Leaflet-Marker-Asset-Problem unter Vite.

import { CircleMarker, MapContainer, Polyline, Tooltip, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { coordinateForId } from '../data/routeNetwork';
import { roleLabel } from '../domain/routeBreakdown';
import type { TransportRoute } from '../domain/types';

export interface RouteMapProps {
  /** Die darzustellende Transport_Route. */
  route: TransportRoute;
}

/** Ein beschrifteter Kartenpunkt einer Station entlang der Route. */
interface MapPoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

/**
 * Leitet die geordnete, zusammenhaengende Punktfolge einer Route ab: der
 * Startpunkt des ersten Segments, danach je Segment der Zielpunkt. Punkte ohne
 * bekannte Koordinate werden uebersprungen.
 */
function routePoints(route: TransportRoute): MapPoint[] {
  const points: MapPoint[] = [];
  const push = (id: string, label: string): void => {
    const coord = coordinateForId(id);
    if (coord) {
      points.push({ id, label, lat: coord.lat, lng: coord.lng });
    }
  };

  route.segments.forEach((segment, index) => {
    if (index === 0) {
      push(segment.fromId, `Start (${roleLabel(segment.role)})`);
    }
    push(segment.toId, roleLabel(segment.role));
  });

  return points;
}

export default function RouteMap({ route }: RouteMapProps): React.JSX.Element | null {
  const points = routePoints(route);
  if (points.length < 2) {
    return null;
  }

  const polyline: [number, number][] = points.map((p) => [p.lat, p.lng]);
  // Kartenmittelpunkt grob aus dem Mittel der Punkte.
  const center: [number, number] = [
    points.reduce((s, p) => s + p.lat, 0) / points.length,
    points.reduce((s, p) => s + p.lng, 0) / points.length,
  ];

  return (
    <MapContainer
      center={center}
      zoom={7}
      scrollWheelZoom={false}
      style={{ height: 360, width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap-Mitwirkende'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={polyline} pathOptions={{ color: '#1d1d1b', weight: 3 }} />
      {points.map((p, index) => (
        <CircleMarker
          key={`${p.id}-${index}`}
          center={[p.lat, p.lng]}
          radius={7}
          pathOptions={{ color: '#1d1d1b', fillColor: '#ffcc00', fillOpacity: 1, weight: 2 }}
        >
          <Tooltip permanent direction="top" offset={[0, -8]}>
            {`${index + 1}. ${p.id}`}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
