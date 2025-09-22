import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <MapPin className="text-primary text-2xl h-8 w-8" />
              <h1 className="text-2xl font-bold text-foreground">Beacon</h1>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/search" 
                className={`transition-colors ${
                  location === '/search' 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                data-testid="link-find-groups"
              >
                Find Groups
              </Link>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-add-group"
              >
                Add Your Group
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-about"
              >
                About
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
            <Button data-testid="button-sign-up">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
