import { Client } from '@googlemaps/google-maps-services-js';

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address?: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  permanently_closed?: boolean;
  opening_hours?: {
    open_now?: boolean;
    periods?: any[];
    weekday_text?: string[];
  };
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }[];
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  opening_hours?: {
    open_now?: boolean;
    periods?: any[];
    weekday_text?: string[];
  };
  types: string[];
  reviews?: any[];
}

export class GooglePlacesService {
  private client: Client;
  private apiKey: string;

  constructor(apiKey: string) {
    this.client = new Client({});
    this.apiKey = apiKey;
  }

  /**
   * Search for religious places of worship near a location
   */
  async searchReligiousPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000,
    nextPageToken?: string
  ): Promise<{
    results: GooglePlaceResult[];
    next_page_token?: string;
  }> {
    try {
      // Define religious place types supported by Google Places API
      const religiousTypes = [
        'church',
        'mosque', 
        'synagogue',
        'hindu_temple',
        'place_of_worship'
      ];

      // Build params object with proper validation
      const params: any = {
        location: `${location.lat},${location.lng}`, // Google Places API expects "lat,lng" string
        radius: radius,
        type: 'place_of_worship',
        key: this.apiKey
      };

      // Only include pagetoken if it exists and is a non-empty string
      if (nextPageToken && typeof nextPageToken === 'string' && nextPageToken.trim()) {
        params.pagetoken = nextPageToken;
      }

      // We'll search for general "place_of_worship" first as it covers most religious sites
      const response = await this.client.placesNearby({
        params: params
      });

      if (response.data.status === 'OK') {
        return {
          results: response.data.results as GooglePlaceResult[],
          next_page_token: response.data.next_page_token
        };
      } else {
        console.error('Google Places API error:', response.data.status, response.data.error_message);
        return { results: [] };
      }
    } catch (error) {
      console.error('Error searching religious places:', error);
      return { results: [] };
    }
  }

  /**
   * Search for religious places by text query
   */
  async searchReligiousByText(
    query: string,
    location?: { lat: number; lng: number },
    nextPageToken?: string
  ): Promise<{
    results: GooglePlaceResult[];
    next_page_token?: string;
  }> {
    try {
      const params: any = {
        query: `${query} church mosque synagogue temple place of worship`,
        key: this.apiKey
      };

      // Only include pagetoken if it exists and is a non-empty string
      if (nextPageToken && typeof nextPageToken === 'string' && nextPageToken.trim()) {
        params.pagetoken = nextPageToken;
      }

      if (location) {
        // Google Places API expects location as "lat,lng" string, not object
        params.location = `${location.lat},${location.lng}`;
        params.radius = 50000; // 50km radius for text search
      }

      const response = await this.client.textSearch({
        params: params
      });

      if (response.data.status === 'OK') {
        return {
          results: response.data.results as GooglePlaceResult[],
          next_page_token: response.data.next_page_token
        };
      } else {
        console.error('Google Places API text search error:', response.data.status, response.data.error_message);
        return { results: [] };
      }
    } catch (error) {
      console.error('Error in text search for religious places:', error);
      return { results: [] };
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'place_id',
            'name', 
            'formatted_address',
            'geometry',
            'formatted_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'business_status',
            'opening_hours',
            'types',
            'reviews'
          ],
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.result) {
        return response.data.result as GooglePlaceDetails;
      } else {
        console.error('Google Places details error:', response.data.status, response.data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Convert Google Place result to our faith group format
   */
  convertToFaithGroup(place: GooglePlaceResult, details?: GooglePlaceDetails): any {
    const placeData = details || place;
    
    // Extract religion from place types
    let religion = 'Other';
    let denomination = '';
    
    if (placeData.types.includes('church')) {
      religion = 'Christianity';
      denomination = 'Christian';
    } else if (placeData.types.includes('mosque')) {
      religion = 'Islam';  
      denomination = 'Islamic';
    } else if (placeData.types.includes('synagogue')) {
      religion = 'Judaism';
      denomination = 'Jewish';
    } else if (placeData.types.includes('hindu_temple')) {
      religion = 'Hinduism';
      denomination = 'Hindu';
    } else if (placeData.types.includes('place_of_worship')) {
      religion = 'Christianity'; // Default assumption, can be updated later
      denomination = 'Non-denominational';
    }

    // Parse address components
    const address = placeData.formatted_address || (place as any).vicinity || '';
    const addressParts = address.split(', ');
    
    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';
    
    if (addressParts.length >= 3) {
      street = addressParts[0];
      city = addressParts[addressParts.length - 3] || addressParts[addressParts.length - 2];
      const lastPart = addressParts[addressParts.length - 1];
      const stateZip = lastPart.split(' ');
      state = stateZip[0] || '';
      zipCode = stateZip[1] || '';
    }

    // Generate service times from opening hours if available
    let serviceTimes: any[] = [];
    if (details?.opening_hours?.weekday_text) {
      serviceTimes = details.opening_hours.weekday_text.map(text => ({
        day: text.split(': ')[0],
        time: text.split(': ')[1] || 'Closed'
      }));
    } else {
      // Default service times based on religion
      if (religion === 'Christianity') {
        serviceTimes = [
          { day: 'Sunday Morning', time: '10:00 AM' },
          { day: 'Sunday Evening', time: '6:00 PM' }
        ];
      } else if (religion === 'Islam') {
        serviceTimes = [
          { day: 'Friday Prayer', time: '12:30 PM' },
          { day: 'Daily Prayers', time: '5 times daily' }
        ];
      } else if (religion === 'Judaism') {
        serviceTimes = [
          { day: 'Friday Evening', time: '6:00 PM' },
          { day: 'Saturday Morning', time: '10:00 AM' }
        ];
      }
    }

    return {
      name: placeData.name,
      religion,
      denomination,
      description: `${denomination} place of worship located in ${city}, ${state}. ${placeData.rating ? `Highly rated with ${placeData.rating} stars.` : ''}`.trim(),
      longDescription: `${placeData.name} is a ${denomination.toLowerCase()} place of worship serving the ${city}, ${state} community. ${details?.user_ratings_total ? `With ${details.user_ratings_total} reviews and a ${details.rating} star rating, ` : ''}this location welcomes visitors and provides spiritual services to the local community.`,
      address: street,
      city,
      state,
      zipCode,
      latitude: placeData.geometry.location.lat.toString(),
      longitude: placeData.geometry.location.lng.toString(),
      phone: details?.formatted_phone_number || null,
      email: null, // Google doesn't provide email addresses
      website: details?.website || null,
      serviceTimes: JSON.stringify(serviceTimes),
      rating: placeData.rating ? placeData.rating.toString() : '0',
      reviewCount: placeData.user_ratings_total || 0,
      isOpen: (placeData.business_status === 'OPERATIONAL' && !(placeData as any).permanently_closed) ? 'open' : 'closed',
      googlePlaceId: placeData.place_id
    };
  }
}

// Export a configured instance
export const googlePlacesService = new GooglePlacesService(process.env.GOOGLE_MAPS_API_KEY!);