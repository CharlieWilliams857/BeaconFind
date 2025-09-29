import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FaithGroup } from "@shared/schema";

// Custom marker icons for different religions
const createReligiousIcon = (religion: string | null | undefined) => {
  const iconConfig = {
    iconSize: [30, 40] as [number, number],
    iconAnchor: [15, 40] as [number, number],
    popupAnchor: [1, -34] as [number, number],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41] as [number, number]
  };

  switch ((religion || 'other').toLowerCase()) {
    case 'christianity':
      return L.icon({
        ...iconConfig,
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" width="30" height="40">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 13.1 15 25 15 25s15-11.9 15-25C30 6.7 23.3 0 15 0z" fill="#3b82f6"/>
            <path d="M15 8v6h4v3h-4v4h-3v-4H8v-3h4V8z" fill="white"/>
          </svg>
        `)
      });
    case 'islam':
      return L.icon({
        ...iconConfig,
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" width="30" height="40">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 13.1 15 25 15 25s15-11.9 15-25C30 6.7 23.3 0 15 0z" fill="#22c55e"/>
            <path d="M19 11c0-2.2-1.8-4-4-4s-4 1.8-4 4c0 1.3.6 2.4 1.5 3.1-.9.7-1.5 1.8-1.5 3.1 0 2.2 1.8 4 4 4s4-1.8 4-4c0-1.3-.6-2.4-1.5-3.1.9-.7 1.5-1.8 1.5-3.1z" fill="white"/>
            <polygon points="20,10 21,8 23,9 22,11" fill="white"/>
          </svg>
        `)
      });
    case 'judaism':
      return L.icon({
        ...iconConfig,
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" width="30" height="40">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 13.1 15 25 15 25s15-11.9 15-25C30 6.7 23.3 0 15 0z" fill="#8b5cf6"/>
            <polygon points="15,8 18,14 12,14" fill="white"/>
            <polygon points="15,18 12,12 18,12" fill="white"/>
          </svg>
        `)
      });
    case 'hinduism':
    case 'buddhism':
      return L.icon({
        ...iconConfig,
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" width="30" height="40">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 13.1 15 25 15 25s15-11.9 15-25C30 6.7 23.3 0 15 0z" fill="#f97316"/>
            <rect x="9" y="8" width="12" height="8" rx="1" fill="white"/>
            <rect x="13" y="10" width="4" height="2" fill="#f97316"/>
            <rect x="11" y="12" width="8" height="2" fill="#f97316"/>
          </svg>
        `)
      });
    default:
      return L.icon({
        ...iconConfig,
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" width="30" height="40">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 13.1 15 25 15 25s15-11.9 15-25C30 6.7 23.3 0 15 0z" fill="#6b7280"/>
            <circle cx="15" cy="15" r="5" fill="white"/>
          </svg>
        `)
      });
  }
};

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

    try {
      // Clean up existing map before creating new one
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      // Initialize map
      mapInstance.current = L.map(mapRef.current).setView(
        center || [37.7749, -122.4194], // Default to San Francisco
        zoom
      );

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstance.current);

      const map = mapInstance.current;

      // Add markers for faith groups
      faithGroups.forEach((faithGroup) => {
        const lat = parseFloat(faithGroup.latitude);
        const lng = parseFloat(faithGroup.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const religiousIcon = createReligiousIcon(faithGroup.religion);
          const marker = L.marker([lat, lng], { icon: religiousIcon }).addTo(map);
          
          marker.bindPopup(`
            <div class="p-4 min-w-64 bg-card text-card-foreground rounded-lg shadow-lg">
              <h3 class="font-semibold text-base mb-2 text-foreground">${faithGroup.name}</h3>
              <div class="flex items-center mb-2">
                <div class="flex items-center mr-4">
                  ${[...Array(5)].map((_, i) => 
                    `<svg class="h-3 w-3 ${i < Math.floor(parseFloat(faithGroup.rating || '0')) ? 'text-yellow-400 fill-current' : 'text-gray-300'}" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>`
                  ).join('')}
                  <span class="text-sm font-medium ml-1 text-foreground">${faithGroup.rating || '0'}</span>
                </div>
                <span class="text-xs text-muted-foreground">(${faithGroup.reviewCount || 0} reviews)</span>
              </div>
              <p class="text-sm text-muted-foreground mb-2">${faithGroup.denomination || faithGroup.religion}</p>
              <p class="text-xs text-muted-foreground mb-3">${faithGroup.address}</p>
              <div class="flex gap-2">
                <a href="/faith-groups/${faithGroup.id}" class="inline-flex items-center px-3 py-1.5 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                  View Details
                </a>
                <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(faithGroup.address)}', '_blank')" class="inline-flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/80 transition-colors">
                  Get Directions
                </button>
              </div>
            </div>
          `, {
            maxWidth: 300,
            className: 'custom-popup'
          });
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
            const religiousIcon = createReligiousIcon(faithGroup.religion);
            group.addLayer(L.marker([lat, lng], { icon: religiousIcon }));
          }
        });
        
        if (group.getLayers().length > 0) {
          map.fitBounds(group.getBounds().pad(0.1));
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup on unmount
    return () => {
      try {
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      } catch (error) {
        console.warn('Error cleaning up map:', error);
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
