import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Download, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AutocompleteInput from "@/components/ui/autocomplete-input";

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface SearchResponse {
  results: GooglePlace[];
  next_page_token?: string;
}

export default function GooglePlacesImport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Search form state
  const [searchLocation, setSearchLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState("5000");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  // Selected places for import
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  
  // Search results
  const [searchResults, setSearchResults] = useState<GooglePlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Geocode location to get coordinates
  const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number }> => {
    const response = await fetch(`/api/geocode?location=${encodeURIComponent(location)}`);
    if (!response.ok) {
      throw new Error('Failed to geocode location');
    }
    const data = await response.json();
    return { lat: data.latitude, lng: data.longitude };
  };

  // Search Google Places
  const searchGooglePlaces = async (pageToken?: string) => {
    if (!coordinates) return;
    
    const isLoadMore = !!pageToken;
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsSearching(true);
      setSearchResults([]); // Clear previous results for new search
      setSelectedPlaces(new Set()); // Clear selections
    }
    
    try {
      const params = new URLSearchParams({
        lat: coordinates.lat.toString(),
        lng: coordinates.lng.toString(),
        radius: radius,
      });
      
      if (searchQuery) {
        params.append('query', searchQuery);
      }
      
      if (pageToken) {
        params.append('pageToken', pageToken);
      }
      
      const response = await fetch(`/api/google-places/search?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        
        if (errorData.code === 'AUTH_REQUIRED') {
          toast({
            title: "Sign in required",
            description: "Please sign in to search for places to import",
            variant: "destructive",
          });
          return;
        }
        
        if (errorData.code === 'MISSING_API_KEY') {
          toast({
            title: "Configuration required",
            description: "Google Maps API key not configured. Please contact admin to add GOOGLE_MAPS_API_KEY secret.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(errorData.message || 'Failed to search Google Places');
      }
      
      const data: SearchResponse = await response.json();
      
      // Append results for load more, or replace for new search
      if (isLoadMore) {
        setSearchResults(prev => [...prev, ...data.results]);
      } else {
        setSearchResults(data.results);
      }
      
      setNextPageToken(data.next_page_token || null);
      
      toast({
        title: isLoadMore ? "More results loaded" : "Search completed",
        description: isLoadMore 
          ? `Loaded ${data.results.length} more places (${searchResults.length + data.results.length} total)`
          : `Found ${data.results.length} religious places near ${searchLocation}${data.next_page_token ? ' (more available)' : ''}`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Failed to search Google Places",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  // Handle location search
  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a location to search",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const coords = await geocodeLocation(searchLocation);
      setCoordinates(coords);
      toast({
        title: "Location found",
        description: `Coordinates: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      });
    } catch (error) {
      toast({
        title: "Location not found",
        description: "Could not find coordinates for this location",
        variant: "destructive",
      });
    }
  };

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (placeIds: string[]): Promise<any> => {
      const response = await fetch('/api/google-places/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ placeIds }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to import places');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Import completed",
        description: `Imported ${data.importedCount} of ${data.totalRequested} places`,
      });
      
      if (data.errors && data.errors.length > 0) {
        console.warn('Import errors:', data.errors);
      }
      
      // Clear selections and refresh faith groups
      setSelectedPlaces(new Set());
      queryClient.invalidateQueries({ queryKey: ['/api/faith-groups'] });
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import places",
        variant: "destructive",
      });
    }
  });

  // Toggle place selection
  const togglePlaceSelection = (placeId: string) => {
    const newSelection = new Set(selectedPlaces);
    if (newSelection.has(placeId)) {
      newSelection.delete(placeId);
    } else {
      newSelection.add(placeId);
    }
    setSelectedPlaces(newSelection);
  };

  // Select all places
  const selectAllPlaces = () => {
    setSelectedPlaces(new Set(searchResults.map(place => place.place_id)));
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedPlaces(new Set());
  };

  // Import selected places
  const handleImport = () => {
    if (selectedPlaces.size === 0) {
      toast({
        title: "No places selected",
        description: "Please select places to import",
        variant: "destructive",
      });
      return;
    }
    
    importMutation.mutate(Array.from(selectedPlaces));
  };

  // Get place type badge variant
  const getPlaceTypeBadge = (types: string[]) => {
    if (types.includes('church')) return 'church';
    if (types.includes('mosque')) return 'mosque';
    if (types.includes('synagogue')) return 'synagogue';
    if (types.includes('hindu_temple')) return 'temple';
    return 'worship';
  };

  // Get place type label
  const getPlaceTypeLabel = (types: string[]) => {
    if (types.includes('church')) return 'Church';
    if (types.includes('mosque')) return 'Mosque';
    if (types.includes('synagogue')) return 'Synagogue';
    if (types.includes('hindu_temple')) return 'Hindu Temple';
    if (types.includes('place_of_worship')) return 'Place of Worship';
    return 'Religious Site';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Google Places Import</h1>
        <p className="text-muted-foreground">
          Import faith communities from Google Places API to expand your database with real-world locations.
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search for Religious Places
          </CardTitle>
          <CardDescription>
            Enter a location to find nearby faith communities from Google Places
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <AutocompleteInput
                  value={searchLocation}
                  onChange={setSearchLocation}
                  placeholder="e.g., San Francisco, CA"
                  endpoint="/api/suggestions/locations/admin"
                  data-testid="input-location"
                  className="flex-1"
                />
                <Button onClick={handleLocationSearch} variant="outline" data-testid="button-geocode">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
              {coordinates && (
                <p className="text-sm text-muted-foreground mt-1">
                  Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="query">Search Query (Optional)</Label>
              <Input
                id="query"
                placeholder="e.g., baptist church, synagogue"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-query"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="radius">Search Radius (meters)</Label>
            <Input
              id="radius"
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              min="100"
              max="50000"
              data-testid="input-radius"
            />
          </div>
          
          <Button
            onClick={searchGooglePlaces}
            disabled={!coordinates || isSearching}
            className="w-full md:w-auto"
            data-testid="button-search"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Places
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results ({searchResults.length} places)</CardTitle>
                <CardDescription>
                  Select places to import into your faith community database
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllPlaces} data-testid="button-select-all">
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllSelections} data-testid="button-clear-all">
                  Clear All
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selectedPlaces.size === 0 || importMutation.isPending}
                  size="sm"
                  data-testid="button-import"
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import ({selectedPlaces.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {searchResults.map((place) => (
                <div
                  key={place.place_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlaces.has(place.place_id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => togglePlaceSelection(place.place_id)}
                  data-testid={`place-card-${place.place_id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{place.name}</h3>
                        <Badge variant="outline">
                          {getPlaceTypeLabel(place.types)}
                        </Badge>
                        {selectedPlaces.has(place.place_id) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-2">
                        {place.formatted_address || place.vicinity}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {place.rating && (
                          <span className="flex items-center gap-1">
                            ⭐ {place.rating.toFixed(1)}
                            {place.user_ratings_total && (
                              <span className="text-muted-foreground">
                                ({place.user_ratings_total} reviews)
                              </span>
                            )}
                          </span>
                        )}
                        
                        <Badge
                          variant={place.business_status === 'OPERATIONAL' ? 'default' : 'secondary'}
                        >
                          {place.business_status || 'Unknown Status'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {nextPageToken && (
              <div className="mt-6 text-center">
                <Button
                  onClick={() => searchGooglePlaces(nextPageToken)}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  data-testid="button-load-more"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading more places...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Load More Places
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Empty state */}
      {searchResults.length === 0 && !isSearching && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results yet</h3>
            <p className="text-muted-foreground">
              Enter a location and search to find religious places to import
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}