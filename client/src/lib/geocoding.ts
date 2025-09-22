export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

export async function geocodeLocation(location: string): Promise<GeocodeResult> {
  const response = await fetch(`/api/geocode?location=${encodeURIComponent(location)}`);
  
  if (!response.ok) {
    throw new Error('Failed to geocode location');
  }
  
  const data = await response.json();
  return {
    lat: data.latitude,
    lng: data.longitude,
    formatted_address: data.formatted_address
  };
}
