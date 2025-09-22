import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Religion, denomination, or keyword"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-border focus:ring-2 focus:ring-ring"
              data-testid="input-religion"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="City, state, or zip code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-border focus:ring-2 focus:ring-ring"
              data-testid="input-location"
            />
          </div>
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
