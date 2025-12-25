import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TripMapProps {
  pickup: string;
  drop: string;
  className?: string;
}

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function TripMap({ pickup, drop, className = '' }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center (India)
    const defaultCenter: [number, number] = [20.5937, 78.9629];
    
    mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstanceRef.current);

    // Add markers for pickup and drop with labels
    const pickupMarker = L.marker(defaultCenter)
      .addTo(mapInstanceRef.current)
      .bindPopup(`<strong>Pickup:</strong> ${pickup}`);

    const dropMarker = L.marker([defaultCenter[0] + 2, defaultCenter[1] + 3])
      .addTo(mapInstanceRef.current)
      .bindPopup(`<strong>Drop:</strong> ${drop}`);

    // Draw a line between pickup and drop
    const polyline = L.polyline([
      defaultCenter,
      [defaultCenter[0] + 2, defaultCenter[1] + 3]
    ], { 
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
  }, [pickup, drop]);

  return (
    <div 
      ref={mapRef} 
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: '200px' }}
    />
  );
}
