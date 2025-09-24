import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Star, 
  Navigation,
  Clock
} from "lucide-react";
import MapView from "@/components/map-view";
import type { FaithGroup } from "@shared/schema";

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: faithGroup, isLoading, error } = useQuery({
    queryKey: ['/api/faith-groups', id],
    queryFn: async () => {
      const response = await fetch(`/api/faith-groups/${id}`);
      if (!response.ok) {
        throw new Error('Faith group not found');
      }
      return response.json() as Promise<FaithGroup>;
    },
    enabled: Boolean(id),
  });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6" data-testid="page-detail-error">
        <div className="text-center">
          <p className="text-destructive">Faith group not found.</p>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/search')}
            className="mt-4"
            data-testid="button-back-to-search"
          >
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const serviceTimes = faithGroup?.serviceTimes 
    ? JSON.parse(faithGroup.serviceTimes) 
    : [];

  const mockReviews = [
    {
      author: "Sarah M.",
      rating: 5,
      text: "Wonderful community! The pastor's messages are inspiring and the congregation is very welcoming. Great programs for families."
    },
    {
      author: "David R.", 
      rating: 4,
      text: "Been attending for 2 years. Love the music ministry and the focus on community service. Small groups are a great way to connect."
    }
  ];

  return (
    <div className="min-h-screen" data-testid="page-detail">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detail Info */}
          <div>
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/search')}
              className="mb-6"
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to results
            </Button>

            {isLoading ? (
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-10 w-3/4 mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : faithGroup && (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-4xl font-bold mb-4" data-testid="text-faith-group-name">
                    {faithGroup.name}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(parseFloat(faithGroup.rating || '0'))
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-medium" data-testid="text-rating">
                      {faithGroup.rating}
                    </span>
                    <span className="text-muted-foreground" data-testid="text-review-count">
                      ({faithGroup.reviewCount} reviews)
                    </span>
                  </div>
                  <p className="text-xl text-muted-foreground mb-2" data-testid="text-denomination">
                    {faithGroup.denomination || faithGroup.religion}
                  </p>
                  <p className="text-muted-foreground" data-testid="text-address">
                    {faithGroup.address}, {faithGroup.city}, {faithGroup.state} {faithGroup.zipCode}
                  </p>
                </div>

                {/* Contact Information */}
                <Card className="mb-6" data-testid="card-contact-info">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      {faithGroup.phone && (
                        <div className="flex items-center">
                          <Phone className="text-primary w-5 h-5 mr-3" />
                          <span data-testid="text-phone">{faithGroup.phone}</span>
                        </div>
                      )}
                      {faithGroup.email && (
                        <div className="flex items-center">
                          <Mail className="text-primary w-5 h-5 mr-3" />
                          <span data-testid="text-email">{faithGroup.email}</span>
                        </div>
                      )}
                      {faithGroup.website && (
                        <div className="flex items-center">
                          <Globe className="text-primary w-5 h-5 mr-3" />
                          <span data-testid="text-website">{faithGroup.website}</span>
                        </div>
                      )}
                      <div className="flex items-start">
                        <MapPin className="text-primary w-5 h-5 mr-3 mt-1" />
                        <span data-testid="text-full-address">
                          {faithGroup.address}<br/>
                          {faithGroup.city}, {faithGroup.state} {faithGroup.zipCode}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Times */}
                {serviceTimes.length > 0 && (
                  <Card className="mb-6" data-testid="card-service-times">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Service Times</h3>
                      <div className="space-y-2">
                        {serviceTimes.map((service: any, index: number) => (
                          <div key={index} className="flex justify-between" data-testid={`service-time-${index}`}>
                            <span className="font-medium">{service.day}</span>
                            <span className="text-muted-foreground">{service.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Description */}
                <Card data-testid="card-description">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">About Us</h3>
                    <p className="text-foreground leading-relaxed mb-6" data-testid="text-description">
                      {faithGroup.longDescription || faithGroup.description}
                    </p>
                    
                    <div>
                      <h4 className="font-semibold mb-2">What We Offer:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Worship services and spiritual guidance</li>
                        <li>Community fellowship and events</li>
                        <li>Religious education programs</li>
                        <li>Community outreach initiatives</li>
                        <li>Pastoral care and counseling</li>
                        <li>Youth and family programs</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-muted rounded-xl h-80 relative overflow-hidden" data-testid="map-container-detail">
              {faithGroup && (
                <MapView 
                  faithGroups={[faithGroup]}
                  center={{ 
                    lat: parseFloat(faithGroup.latitude), 
                    lng: parseFloat(faithGroup.longitude) 
                  }}
                  zoom={15}
                  data-testid="map-view-detail"
                />
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4" data-testid="quick-actions">
              <Button 
                className="py-3"
                onClick={() => {
                  if (faithGroup) {
                    const address = encodeURIComponent(`${faithGroup.address}, ${faithGroup.city}, ${faithGroup.state}`);
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                  }
                }}
                data-testid="button-directions"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
              {faithGroup?.website && (
                <Button 
                  variant="secondary"
                  className="py-3"
                  onClick={() => {
                    if (faithGroup?.website) {
                      window.open(faithGroup.website, '_blank');
                    }
                  }}
                  data-testid="button-website"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Website
                </Button>
              )}
            </div>

            {/* Recent Reviews */}
            <Card data-testid="card-reviews">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {mockReviews.map((review, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium" data-testid={`review-author-${index}`}>
                          {review.author}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`review-text-${index}`}>
                        {review.text}
                      </p>
                      {index < mockReviews.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
                <Button variant="link" className="text-primary p-0 mt-4" data-testid="button-all-reviews">
                  See all reviews
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
