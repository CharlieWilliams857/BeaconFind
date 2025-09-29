import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignInModal from "@/components/sign-in-modal";
import { SignUpModal } from "@/components/sign-up-modal";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  return (
    <nav className="navbar-overlay" data-testid="navbar">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
          <MapPin className="text-white text-2xl h-8 w-8" />
          <h1 className="text-2xl font-bold text-white">Beacon</h1>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 animate-pulse rounded-full" />
          </div>
        ) : isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full hover:bg-white/10"
                data-testid="button-user-menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user.profileImageUrl || undefined} 
                    alt={`${user.firstName} ${user.lastName}`} 
                  />
                  <AvatarFallback className="bg-white/20 text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api/logout" className="cursor-pointer w-full" data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button 
              variant="ghost" 
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setShowSignInModal(true)}
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
            <Button 
              className="bg-white text-black hover:bg-white/90"
              onClick={() => setShowSignUpModal(true)}
              data-testid="button-sign-up"
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
      
      <SignInModal 
        open={showSignInModal} 
        onOpenChange={setShowSignInModal} 
      />
      
      <SignUpModal 
        isOpen={showSignUpModal} 
        onClose={() => setShowSignUpModal(false)} 
      />
    </nav>
  );
}