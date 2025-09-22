import { Link } from "wouter";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4 mt-16" data-testid="footer">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="text-primary text-xl h-6 w-6" />
              <h3 className="text-xl font-bold" data-testid="text-footer-logo">Beacon</h3>
            </div>
            <p className="text-muted-foreground text-sm" data-testid="text-footer-description">
              Connecting people with faith communities worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-users-title">For Users</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className="hover:text-foreground" data-testid="link-footer-find-groups">
                  Find Groups
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-foreground" data-testid="link-footer-browse">
                  Browse by Faith
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground" data-testid="link-footer-mobile">
                  Mobile App
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-orgs-title">For Organizations</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground" data-testid="link-footer-add-group">
                  Add Your Group
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground" data-testid="link-footer-manage">
                  Manage Listing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground" data-testid="link-footer-resources">
                  Resources
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-support-title">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground" data-testid="link-footer-help">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground" data-testid="link-footer-contact">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground" data-testid="link-footer-privacy">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p data-testid="text-copyright">&copy; 2024 Beacon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
