import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";

interface LocationPickerProps {
  label: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  onAddressChange: (address: string) => void;
  onLocationChange: (lat: number, lng: number) => void;
}

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center

  useEffect(() => {
    if (lat && lng) {
      setMapCenter([lat, lng]);
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
        onLocationChange(parseFloat(newLat), parseFloat(newLng));
        onAddressChange(display_name);
        setMapCenter([parseFloat(newLat), parseFloat(newLng)]);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleMapClick = async (clickLat: number, clickLng: number) => {
    onLocationChange(clickLat, clickLng);
    
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button type="button" variant="secondary" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[250px] rounded-lg overflow-hidden border">
            <MapContainer
              center={mapCenter}
              zoom={lat && lng ? 15 : 5}
              style={{ height: "100%", width: "100%" }}
              key={`${mapCenter[0]}-${mapCenter[1]}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              {lat && lng && (
                <Marker position={[lat, lng]} icon={customIcon} />
              )}
            </MapContainer>
          </div>
          <p className="text-xs text-muted-foreground">Click on the map to set location</p>
        </div>
      )}
    </div>
  );
}
