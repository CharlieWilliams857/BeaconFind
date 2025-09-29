import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import FaithGroupCard from "@/components/faith-group-card";
import MapView from "@/components/map-view";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { geocodeLocation } from "@/lib/geocoding";
import type { FaithGroup } from "@shared/schema";

export default function Results() {
  const [location, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search));
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState('distance');
  const [displayCount, setDisplayCount] = useState(4);

  // Update searchParams when URL changes
  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
    setDisplayCount(4); // Reset display count when search changes
  }, [location]);

  const religion = searchParams.get('religion') || '';
  const locationQuery = searchParams.get('location') || '';

  // Geocode location when search params change
  useEffect(() => {
    const geocodeLocationQuery = async () => {
      if (locationQuery) {
        try {
          const coords = await geocodeLocation(locationQuery);
          setCoordinates(coords);
        } catch (error) {
          console.error('Failed to geocode location:', error);
        }
      }
    };

    geocodeLocationQuery();
  }, [locationQuery]);

  // Search faith groups
  const { data: faithGroups = [], isLoading, error } = useQuery({
    queryKey: ['/api/faith-groups/search', religion, coordinates?.lat, coordinates?.lng],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (religion) params.set('religion', religion);
      if (coordinates) {
        params.set('latitude', coordinates.lat.toString());
        params.set('longitude', coordinates.lng.toString());
        params.set('radius', '25'); // 25 mile radius
      }
      
      const response = await fetch(`/api/faith-groups/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search faith groups');
      }
      return response.json() as Promise<(FaithGroup & { distance?: number })[]>;
    },
    enabled: Boolean(religion || coordinates),
  });


  const removeFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setLocation(`/search?${newParams.toString()}`);
    setSearchParams(newParams);
  };


  // Sort faith groups
  const sortedFaithGroups = [...faithGroups].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
      case 'name':
        return a.name.localeCompare(b.name);
      case 'distance':
      default:
        return (a.distance || 0) - (b.distance || 0);
    }
  });

  // Slice results for display (show only first displayCount items)
  const displayedFaithGroups = sortedFaithGroups.slice(0, displayCount);
  const hasMoreResults = sortedFaithGroups.length > displayCount;

  const loadMoreResults = () => {
    setDisplayCount(prev => Math.min(prev + 4, sortedFaithGroups.length));
  };


  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6" data-testid="page-results-error">
        <div className="text-center">
          <p className="text-destructive">Failed to load search results. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col" data-testid="page-results">

      {/* Results Layout */}
      <div className="flex-1 max-w-7xl mx-auto px-4 pt-24 pb-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Results List */}
          <div className="overflow-y-auto pr-2" data-testid="results-list">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" data-testid="text-results-title">
                Faith Groups{locationQuery && ` in ${locationQuery}`}
              </h2>
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={(value) => {
                  setSortBy(value);
                  setDisplayCount(4); // Reset display count when sort changes
                }}>
                  <SelectTrigger className="w-32" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground" data-testid="text-results-count">
                  {faithGroups.length} results
                </span>
              </div>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 mb-6" data-testid="filter-tags">
              {religion && (
                <Badge 
                  variant="default" 
                  className="cursor-pointer"
                  data-testid="filter-religion"
                >
                  {religion}
                  <X 
                    className="ml-1 h-3 w-3" 
                    onClick={() => removeFilter('religion')}
                  />
                </Badge>
              )}
              {locationQuery && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer"
                  data-testid="filter-location"
                >
                  {locationQuery}
                  <X 
                    className="ml-1 h-3 w-3" 
                    onClick={() => removeFilter('location')}
                  />
                </Badge>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4" data-testid="results-loading">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {!isLoading && (
              <div className="space-y-4">
                {sortedFaithGroups.length === 0 ? (
                  <div className="text-center py-12" data-testid="results-empty">
                    <p className="text-muted-foreground">
                      No faith groups found matching your search criteria.
                    </p>
                  </div>
                ) : (
                  <>
                    {displayedFaithGroups.map((faithGroup) => (
                      <FaithGroupCard 
                        key={faithGroup.id} 
                        faithGroup={faithGroup}
                        distance={faithGroup.distance}
                        data-testid={`card-faith-group-${faithGroup.id}`}
                      />
                    ))}
                    
                    {hasMoreResults && (
                      <div className="flex justify-center pt-6 pb-4">
                        <Button
                          onClick={loadMoreResults}
                          variant="outline"
                          className="px-8"
                          data-testid="button-load-more"
                        >
                          Show more results ({sortedFaithGroups.length - displayCount} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Map View */}
          <div className="bg-muted rounded-xl overflow-hidden h-full" data-testid="map-container">
            <MapView 
              faithGroups={sortedFaithGroups}
              center={coordinates}
              data-testid="map-view"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
