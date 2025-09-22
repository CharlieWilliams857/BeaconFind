import { useState } from "react";
import { useLocation } from "wouter";
import SearchBar from "@/components/search-bar";
import CategoryGrid from "@/components/category-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleSearch = (religion: string, location: string) => {
    const params = new URLSearchParams();
    if (religion) params.set('religion', religion);
    if (location) params.set('location', location);
    setLocation(`/search?${params.toString()}`);
  };

  const handleCategoryClick = (religion: string) => {
    const params = new URLSearchParams();
    params.set('religion', religion);
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen" data-testid="page-home">
      {/* Hero Section */}
      <section className="hero-gradient py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6" data-testid="text-hero-title">
            Find Your Faith Community
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Discover welcoming faith groups, churches, temples, and spiritual communities in your area.
          </p>
          
          <SearchBar onSearch={handleSearch} data-testid="search-bar-hero" />
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-categories-title">
            Browse by Faith
          </h2>
          <CategoryGrid onCategoryClick={handleCategoryClick} data-testid="category-grid" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-features-title">
            Why Choose Beacon?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-border" data-testid="card-feature-location">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <MapPin className="text-3xl text-primary mr-4 h-8 w-8" />
                  <h3 className="text-xl font-semibold">Location-Based Search</h3>
                </div>
                <p className="text-muted-foreground">
                  Find faith communities near you with precise location mapping and distance calculations.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border" data-testid="card-feature-communities">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Users className="text-3xl text-primary mr-4 h-8 w-8" />
                  <h3 className="text-xl font-semibold">Diverse Communities</h3>
                </div>
                <p className="text-muted-foreground">
                  Discover welcoming communities across all faiths, denominations, and spiritual practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
