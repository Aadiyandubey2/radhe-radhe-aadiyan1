import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TripMapProps {
  pickup: string;
  drop: string;
  pickupCoords?: [number, number];
  dropCoords?: [number, number];
  className?: string;
}

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function TripMap({ pickup, drop, pickupCoords, dropCoords, className = '' }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center (India)
    const defaultCenter: [number, number] = [20.5937, 78.9629];
    
    // Use provided coordinates or defaults
    const pickupLatLng: [number, number] = pickupCoords || defaultCenter;
    const dropLatLng: [number, number] = dropCoords || [defaultCenter[0] + 2, defaultCenter[1] + 3];
    
    mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstanceRef.current);

    // Add markers for pickup and drop with colored icons
    L.marker(pickupLatLng, { icon: greenIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<strong>Pickup:</strong> ${pickup}`)
      .openPopup();

    L.marker(dropLatLng, { icon: redIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<strong>Drop:</strong> ${drop}`);

    // Draw a line between pickup and drop
    const polyline = L.polyline([pickupLatLng, dropLatLng], { 
      color: 'hsl(217, 91%, 60%)', 
      weight: 3,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current);

    // Fit bounds to show both markers
    mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickup, drop, pickupCoords, dropCoords]);

  return (
    <div 
      ref={mapRef} 
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: '200px' }}
    />
  );
}
