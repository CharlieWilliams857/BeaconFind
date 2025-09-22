import { useState } from "react";
import { Button } from "@/components/ui/button";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  onSearch: (religion: string, location: string) => void;
  defaultReligion?: string;
  defaultLocation?: string;
}

export default function SearchBar({ 
  onSearch, 
  defaultReligion = "", 
  defaultLocation = "" 
}: SearchBarProps) {
  const [religion, setReligion] = useState(defaultReligion);
  const [location, setLocation] = useState(defaultLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(religion, location);
  };

  return (
    <div className="bg-card rounded-2xl p-6 search-shadow max-w-4xl mx-auto" data-testid="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AutocompleteInput
            value={religion}
            onChange={setReligion}
            placeholder="Religion, denomination, or keyword"
            icon={<Search className="h-5 w-5" />}
            endpoint="/api/suggestions/religions"
            className="py-4 text-lg border-border focus:ring-2 focus:ring-ring"
            data-testid="input-religion"
          />
          <AutocompleteInput
            value={location}
            onChange={setLocation}
            placeholder="City, state, or zip code"
            icon={<MapPin className="h-5 w-5" />}
            endpoint="/api/suggestions/locations"
            className="py-4 text-lg border-border focus:ring-2 focus:ring-ring"
            data-testid="input-location"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full py-4 text-lg font-semibold"
          data-testid="button-search"
        >
          <Search className="mr-2 h-5 w-5" />
          Search Faith Groups
        </Button>
      </form>
    </div>
  );
}
