import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  label: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  onAddressChange: (address: string) => void;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LocationPicker({
  label,
  address,
  lat,
  lng,
  onAddressChange,
  onLocationChange,
}: LocationPickerProps) {
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!showMap || !mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter: [number, number] = lat && lng ? [lat, lng] : [20.5937, 78.9629];
    
    mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, lat && lng ? 15 : 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(mapInstanceRef.current);

    // Add marker if coordinates exist
    if (lat && lng) {
      markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    }

    // Handle map clicks
    mapInstanceRef.current.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      
      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else if (mapInstanceRef.current) {
        markerRef.current = L.marker([clickLat, clickLng]).addTo(mapInstanceRef.current);
      }

      onLocationChange(clickLat, clickLng);

      // Reverse geocode
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}`
        );
        const data = await response.json();
        if (data.display_name) {
          onAddressChange(data.display_name);
        }
      } catch (error) {
        console.error("Reverse geocode error:", error);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap]);

  // Update marker when lat/lng props change
  useEffect(() => {
    if (mapInstanceRef.current && lat && lng) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
      }
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }, [lat, lng]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat: newLat, lon: newLng, display_name } = data[0];
        const latNum = parseFloat(newLat);
        const lngNum = parseFloat(newLng);
        
        onLocationChange(latNum, lngNum);
        onAddressChange(display_name);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latNum, lngNum], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([latNum, lngNum]);
          } else {
            markerRef.current = L.marker([latNum, lngNum]).addTo(mapInstanceRef.current);
          }
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowMap(!showMap)}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
      
      {lat && lng && (
        <p className="text-xs text-muted-foreground">
          Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}

      {showMap && (
        <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            />
            <Button type="button" variant="secondary" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div 
            ref={mapRef}
            className="h-[250px] rounded-lg overflow-hidden border"
          />
          <p className="text-xs text-muted-foreground">Click on the map to set location</p>
        </div>
      )}
    </div>
  );
}
