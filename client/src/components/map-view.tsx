import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FaithGroup } from "@shared/schema";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  faithGroups: FaithGroup[];
  center?: { lat: number; lng: number } | null;
  zoom?: number;
}

export default function MapView({ faithGroups, center, zoom = 12 }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(
        center || [37.7749, -122.4194], // Default to San Francisco
        zoom
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Clear existing markers
    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for faith groups
    faithGroups.forEach((faithGroup) => {
      const lat = parseFloat(faithGroup.latitude);
      const lng = parseFloat(faithGroup.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng]).addTo(map);
        
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-sm mb-1">${faithGroup.name}</h3>
            <p class="text-xs text-gray-600 mb-1">${faithGroup.denomination || faithGroup.religion}</p>
            <p class="text-xs text-gray-600">${faithGroup.address}</p>
          </div>
        `);
      }
    });

    // Update map center if provided
    if (center) {
      map.setView([center.lat, center.lng], zoom);
    } else if (faithGroups.length > 0) {
      // Fit bounds to show all faith groups
      const group = new L.FeatureGroup();
      faithGroups.forEach((faithGroup) => {
        const lat = parseFloat(faithGroup.latitude);
        const lng = parseFloat(faithGroup.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          group.addLayer(L.marker([lat, lng]));
        }
      });
      
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }

    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [faithGroups, center, zoom]);

  return (
    <div className="relative w-full h-full" data-testid="map-view">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map overlay info */}
      <div className="absolute top-4 left-4 bg-card rounded-lg shadow-lg p-3" data-testid="map-info">
        <h4 className="font-semibold text-sm mb-2">Map View</h4>
        <p className="text-xs text-muted-foreground">
          {faithGroups.length} faith group{faithGroups.length !== 1 ? 's' : ''} found
        </p>
      </div>
    </div>
  );
}
