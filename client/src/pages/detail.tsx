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
    <div className="min-h-screen pt-16" data-testid="page-detail">
      {/* Fixed Header with Back Button */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/search')}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to results
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      ) : faithGroup ? (
        <>
          {/* Hero Section with Large Image */}
          <div className="relative h-80 bg-gradient-to-r from-gray-700 to-gray-900 overflow-hidden">
            {/* Hero Background - placeholder for now */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 opacity-90" />
            
            {/* Hero Content */}
            <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
              <div className="text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-faith-group-name">
                  {faithGroup.name}
                </h1>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center bg-white/10 rounded-lg px-3 py-2">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(parseFloat(faithGroup.rating || '0'))
                              ? 'text-yellow-400 fill-current'
                              : 'text-white/50'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-medium" data-testid="text-rating">
                      {faithGroup.rating}
                    </span>
                    <span className="text-white/80 ml-2" data-testid="text-review-count">
                      ({faithGroup.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <p className="text-xl text-white/90 mb-2" data-testid="text-denomination">
                  {faithGroup.denomination || faithGroup.religion}
                </p>
              </div>
            </div>
          </div>

          {/* Thumbnail Images Row */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, index) => (
                <div 
                  key={index} 
                  className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden"
                  data-testid={`thumbnail-${index}`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-50" />
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Left Column - About Us */}
              <div className="space-y-6">
                <Card data-testid="card-about">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-semibold mb-4">About Us</h3>
                    <p className="text-foreground leading-relaxed mb-6" data-testid="text-description">
                      {faithGroup.longDescription || faithGroup.description}
                    </p>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3">What We Offer:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>Worship services and spiritual guidance</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>Community fellowship and events</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>Religious education programs</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>Community outreach initiatives</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>Pastoral care and counseling</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>Youth and family programs</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button variant="outline" data-testid="button-read-more">
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Service Times & Contact */}
              <div className="space-y-6">
                {/* Service Times */}
                {serviceTimes.length > 0 && (
                  <Card data-testid="card-service-times">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-semibold mb-4">Service Times</h3>
                      <div className="space-y-3">
                        {serviceTimes.map((service: any, index: number) => (
                          <div key={index} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2" data-testid={`service-time-${index}`}>
                            <span className="font-medium">{service.day}</span>
                            <span className="text-muted-foreground">{service.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Information */}
                <Card data-testid="card-contact-info">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      {faithGroup.phone && (
                        <div className="flex items-center">
                          <Phone className="text-primary w-5 h-5 mr-3 flex-shrink-0" />
                          <span data-testid="text-phone">{faithGroup.phone}</span>
                        </div>
                      )}
                      {faithGroup.email && (
                        <div className="flex items-center">
                          <Mail className="text-primary w-5 h-5 mr-3 flex-shrink-0" />
                          <span data-testid="text-email">{faithGroup.email}</span>
                        </div>
                      )}
                      {faithGroup.website && (
                        <div className="flex items-center">
                          <Globe className="text-primary w-5 h-5 mr-3 flex-shrink-0" />
                          <span data-testid="text-website">{faithGroup.website}</span>
                        </div>
                      )}
                      <div className="flex items-start">
                        <MapPin className="text-primary w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                        <span data-testid="text-full-address">
                          {faithGroup.address}<br/>
                          {faithGroup.city}, {faithGroup.state} {faithGroup.zipCode}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-3 mt-6">
                      <Button 
                        className="w-full"
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
                          variant="outline"
                          className="w-full"
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Full Width Map Section */}
          <div className="bg-gray-50 dark:bg-gray-900/50 py-12">
            <div className="max-w-7xl mx-auto px-4">
              <h3 className="text-2xl font-semibold mb-6">Map View</h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-96 relative overflow-hidden" data-testid="map-container-detail">
                <MapView 
                  faithGroups={[faithGroup]}
                  center={{ 
                    lat: parseFloat(faithGroup.latitude), 
                    lng: parseFloat(faithGroup.longitude) 
                  }}
                  zoom={15}
                  data-testid="map-view-detail"
                />
              </div>
            </div>
          </div>

          {/* Recent Reviews Section */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            <Card data-testid="card-reviews">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Recent Reviews</h3>
                <div className="space-y-6">
                  {mockReviews.map((review, index) => (
                    <div key={index} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-lg" data-testid={`review-author-${index}`}>
                          {review.author}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed" data-testid={`review-text-${index}`}>
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Button variant="outline" size="lg" data-testid="button-all-reviews">
                    See all reviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
