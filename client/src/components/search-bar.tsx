import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  onSearch: (religion: string, location: string) => void;
  defaultReligion?: string;
  defaultLocation?: string;
}

// Popular religion options for dropdown
const POPULAR_RELIGIONS = [
  { value: "all", label: "All religious places" },
  { value: "church", label: "Christian Church" },
  { value: "catholic church", label: "Catholic Church" },
  { value: "baptist church", label: "Baptist Church" },
  { value: "methodist church", label: "Methodist Church" },
  { value: "presbyterian church", label: "Presbyterian Church" },
  { value: "lutheran church", label: "Lutheran Church" },
  { value: "evangelical church", label: "Evangelical Church" },
  { value: "orthodox church", label: "Orthodox Church" },
  { value: "mosque", label: "Mosque (Islamic)" },
  { value: "synagogue", label: "Synagogue (Jewish)" },
  { value: "temple", label: "Temple" },
  { value: "hindu temple", label: "Hindu Temple" },
  { value: "buddhist temple", label: "Buddhist Temple" },
  { value: "sikh temple", label: "Sikh Temple (Gurdwara)" },
  { value: "kingdom hall", label: "Kingdom Hall (Jehovah's Witnesses)" },
  { value: "chapel", label: "Chapel" },
  { value: "cathedral", label: "Cathedral" },
  { value: "basilica", label: "Basilica" },
  { value: "monastery", label: "Monastery" },
  { value: "abbey", label: "Abbey" },
];

export default function SearchBar({ 
  onSearch, 
  defaultReligion = "", 
  defaultLocation = "" 
}: SearchBarProps) {
  const [religion, setReligion] = useState(defaultReligion);
  const [location, setLocation] = useState(defaultLocation);
  const [showDropdown, setShowDropdown] = useState(false);
  const religionInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(religion, location);
    setShowDropdown(false);
  };

  const handleReligionSelect = (value: string, label: string) => {
    setReligion(value);
    setShowDropdown(false);
    religionInputRef.current?.blur();
  };

  const handleReligionFocus = () => {
    setShowDropdown(true);
  };

  const handleReligionBlur = (e: React.FocusEvent) => {
    // Delay hiding dropdown to allow clicking on options
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setShowDropdown(false);
      }
    }, 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          religionInputRef.current && !religionInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-card rounded-2xl p-6 search-shadow max-w-4xl mx-auto" data-testid="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Religion Input with Dropdown */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={religionInputRef}
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                onFocus={handleReligionFocus}
                onBlur={handleReligionBlur}
                placeholder="Religion, denomination, or keyword"
                className="py-4 pl-12 text-lg border-border focus:ring-2 focus:ring-ring"
                data-testid="input-religion"
              />
            </div>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                data-testid="religion-dropdown"
              >
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Popular Searches</h3>
                  <div className="space-y-1">
                    {POPULAR_RELIGIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleReligionSelect(option.value, option.label)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                        data-testid={`religion-option-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
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
