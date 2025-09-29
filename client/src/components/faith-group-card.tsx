import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import type { FaithGroup } from "@shared/schema";

interface FaithGroupCardProps {
  faithGroup: FaithGroup;
  distance?: number;
}

export default function FaithGroupCard({ faithGroup, distance }: FaithGroupCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/faith-groups/${faithGroup.id}`);
  };

  return (
    <Card 
      className="card-hover cursor-pointer border-border"
      onClick={handleClick}
      data-testid="faith-group-card"
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-foreground" data-testid="text-faith-group-name">
            {faithGroup.name}
          </h3>
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(parseFloat(faithGroup.rating || '0'))
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-1" data-testid="text-rating">
              {faithGroup.rating}
            </span>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-2" data-testid="text-denomination">
          {faithGroup.denomination || faithGroup.religion}
        </p>
        
        <p className="text-sm text-muted-foreground mb-3" data-testid="text-address">
          {faithGroup.address}, {faithGroup.city}, {faithGroup.state} {faithGroup.zipCode}
        </p>
        
        <p className="text-sm text-foreground mb-3" data-testid="text-description">
          {faithGroup.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {distance && (
              <span data-testid="text-distance">
                <MapPin className="inline h-4 w-4 mr-1" />
                {distance.toFixed(1)} miles
              </span>
            )}
            <span data-testid="text-status">
              <Clock className="inline h-4 w-4 mr-1" />
              {faithGroup.isOpen === 'open' ? 'Open now' : 
               faithGroup.isOpen === 'closed' ? 'Closed' : 'Hours unknown'}
            </span>
            {faithGroup.phone && (
              <span data-testid="text-phone">
                <Phone className="inline h-4 w-4 mr-1" />
                {faithGroup.phone}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
