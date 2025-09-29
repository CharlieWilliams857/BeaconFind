import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchFaithGroupsSchema, insertFaithGroupSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupEmailAuth } from "./emailAuth";
import { googlePlacesService } from "./google-places";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);
  
  // Setup email/password authentication endpoints
  setupEmailAuth(app);

  // Auth routes - supports both Replit Auth and email/password auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      let userId: string | undefined;
      
      // Check for Replit Auth (existing system)
      if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      // Check for email/password auth session
      else if (req.session?.passport?.user) {
        userId = req.session.passport.user;
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user data without password field for security
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Get all faith groups
  app.get("/api/faith-groups", async (req, res) => {
    try {
      const faithGroups = await storage.getFaithGroups();
      res.json(faithGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch faith groups" });
    }
  });

  // Search faith groups
  app.get("/api/faith-groups/search", async (req, res) => {
    try {
      const params = searchFaithGroupsSchema.parse({
        religion: req.query.religion,
        location: req.query.location,
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        radius: req.query.radius ? parseInt(req.query.radius as string) : 10,
      });

      const results = await storage.searchFaithGroups(params);
      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid search parameters", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to search faith groups" });
      }
    }
  });

  // Get single faith group
  app.get("/api/faith-groups/:id", async (req, res) => {
    try {
      const faithGroup = await storage.getFaithGroup(req.params.id);
      if (!faithGroup) {
        return res.status(404).json({ message: "Faith group not found" });
      }
      res.json(faithGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch faith group" });
    }
  });

  // Create faith group
  app.post("/api/faith-groups", async (req, res) => {
    try {
      const validatedData = insertFaithGroupSchema.parse(req.body);
      const faithGroup = await storage.createFaithGroup(validatedData);
      res.status(201).json(faithGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid faith group data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create faith group" });
      }
    }
  });

  // Update faith group
  app.patch("/api/faith-groups/:id", async (req, res) => {
    try {
      const validatedData = insertFaithGroupSchema.partial().parse(req.body);
      const faithGroup = await storage.updateFaithGroup(req.params.id, validatedData);
      
      if (!faithGroup) {
        return res.status(404).json({ message: "Faith group not found" });
      }

      res.json(faithGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid faith group data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update faith group" });
      }
    }
  });

  // Delete faith group
  app.delete("/api/faith-groups/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFaithGroup(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Faith group not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete faith group" });
    }
  });

  // Geocoding proxy endpoint (for location search)
  app.get("/api/geocode", async (req, res) => {
    try {
      const { location } = req.query;
      if (!location || typeof location !== 'string') {
        return res.status(400).json({ message: "Location parameter is required" });
      }

      // In a real app, this would call a geocoding service like Google Maps API
      // For now, return mock coordinates for common cities
      const mockCoordinates: Record<string, { lat: number; lng: number }> = {
        'san francisco': { lat: 37.7749, lng: -122.4194 },
        'san francisco, ca': { lat: 37.7749, lng: -122.4194 },
        'new york': { lat: 40.7128, lng: -74.0060 },
        'new york, ny': { lat: 40.7128, lng: -74.0060 },
        'los angeles': { lat: 34.0522, lng: -118.2437 },
        'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
        'chicago': { lat: 41.8781, lng: -87.6298 },
        'chicago, il': { lat: 41.8781, lng: -87.6298 },
        'houston': { lat: 29.7604, lng: -95.3698 },
        'houston, tx': { lat: 29.7604, lng: -95.3698 },
        'boston': { lat: 42.3601, lng: -71.0589 },
        'boston, ma': { lat: 42.3601, lng: -71.0589 },
        'seattle': { lat: 47.6062, lng: -122.3321 },
        'seattle, wa': { lat: 47.6062, lng: -122.3321 },
        'denver': { lat: 39.7392, lng: -104.9903 },
        'denver, co': { lat: 39.7392, lng: -104.9903 },
        'miami': { lat: 25.7617, lng: -80.1918 },
        'miami, fl': { lat: 25.7617, lng: -80.1918 },
        'atlanta': { lat: 33.7490, lng: -84.3880 },
        'atlanta, ga': { lat: 33.7490, lng: -84.3880 },
        'phoenix': { lat: 33.4484, lng: -112.0740 },
        'phoenix, az': { lat: 33.4484, lng: -112.0740 },
        'philadelphia': { lat: 39.9526, lng: -75.1652 },
        'philadelphia, pa': { lat: 39.9526, lng: -75.1652 },
        'dallas': { lat: 32.7767, lng: -96.7970 },
        'dallas, tx': { lat: 32.7767, lng: -96.7970 },
        'san diego': { lat: 32.7157, lng: -117.1611 },
        'san diego, ca': { lat: 32.7157, lng: -117.1611 },
      };

      const normalizedLocation = location.toLowerCase().trim();
      const coords = mockCoordinates[normalizedLocation];
      
      if (!coords) {
        return res.status(404).json({ message: `Coordinates not found for location: ${location}` });
      }

      res.json({
        location: location,
        latitude: coords.lat,
        longitude: coords.lng,
        formatted_address: `${location}, United States`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to geocode location" });
    }
  });

  // Predictive search suggestions
  app.get("/api/suggestions/religions", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }

      // Common religion/denomination terms for better suggestions
      const commonReligions = [
        "Christianity", "Roman Catholic", "Catholic", "Protestant", "Baptist", "Methodist", 
        "Episcopal", "Presbyterian", "Lutheran", "Pentecostal", "Orthodox", "Non-denominational Christian",
        "Judaism", "Orthodox Judaism", "Conservative Judaism", "Reform Judaism", 
        "Islam", "Sunni Islam", "Shia Islam", "Muslim",
        "Buddhism", "Hinduism", "Sikhism", "Bahá'í Faith", "Unitarian Universalist"
      ];

      const normalizedQuery = q.toLowerCase().trim();
      
      // Get existing religion suggestions first
      const existingSuggestions = await storage.getReligionSuggestions(q);
      
      // Filter common religions that match the query
      const religionSuggestions = commonReligions
        .filter(religion => religion.toLowerCase().includes(normalizedQuery))
        .slice(0, 8);
      
      // Combine and deduplicate suggestions
      const allSuggestions = Array.from(new Set([...existingSuggestions, ...religionSuggestions]));
      
      res.json(allSuggestions.slice(0, 8));
    } catch (error) {
      console.error("Failed to get religion suggestions:", error);
      res.status(500).json({ message: "Failed to get religion suggestions" });
    }
  });

  app.get("/api/suggestions/locations", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }

      // Common major cities to include in suggestions
      const commonCities = [
        "Boston, MA", "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
        "Philadelphia, PA", "Phoenix, AZ", "San Antonio, TX", "San Diego, CA", "Dallas, TX",
        "San Jose, CA", "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH",
        "Charlotte, NC", "San Francisco, CA", "Indianapolis, IN", "Seattle, WA", "Denver, CO",
        "Washington, DC", "Boston, USA", "Miami, FL", "Atlanta, GA", "Las Vegas, NV"
      ];

      const normalizedQuery = q.toLowerCase().trim();
      
      // Get existing location suggestions first
      const existingSuggestions = await storage.getLocationSuggestions(q);
      
      // Filter common cities that match the query
      const citySuggestions = commonCities
        .filter(city => city.toLowerCase().includes(normalizedQuery))
        .slice(0, 8);
      
      // Combine and deduplicate suggestions
      const allSuggestions = Array.from(new Set([...existingSuggestions, ...citySuggestions]));
      
      res.json(allSuggestions.slice(0, 8));
    } catch (error) {
      console.error("Failed to get location suggestions:", error);
      res.status(500).json({ message: "Failed to get location suggestions" });
    }
  });

  // Enhanced location suggestions for admin import (broader city list)
  app.get("/api/suggestions/locations/admin", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }

      // Common US cities for import suggestions
      const commonCities = [
        "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
        "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
        "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL",
        "Fort Worth, TX", "Columbus, OH", "San Francisco, CA", "Charlotte, NC",
        "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Boston, MA",
        "Nashville, TN", "El Paso, TX", "Detroit, MI", "Oklahoma City, OK",
        "Portland, OR", "Las Vegas, NV", "Memphis, TN", "Louisville, KY",
        "Baltimore, MD", "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ",
        "Fresno, CA", "Mesa, AZ", "Sacramento, CA", "Atlanta, GA",
        "Kansas City, MO", "Colorado Springs, CO", "Miami, FL", "Raleigh, NC",
        "Omaha, NE", "Long Beach, CA", "Virginia Beach, VA", "Oakland, CA",
        "Minneapolis, MN", "Tulsa, OK", "Arlington, TX", "Tampa, FL",
        "New Orleans, LA", "Wichita, KS", "Cleveland, OH", "Bakersfield, CA"
      ];

      const normalizedQuery = q.toLowerCase().trim();
      
      // Get existing location suggestions first
      const existingSuggestions = await storage.getLocationSuggestions(q);
      
      // Filter common cities that match the query
      const citySuggestions = commonCities
        .filter(city => city.toLowerCase().includes(normalizedQuery))
        .slice(0, 8);
      
      // Combine and deduplicate suggestions
      const allSuggestions = Array.from(new Set([...existingSuggestions, ...citySuggestions]));
      
      res.json(allSuggestions.slice(0, 8));
    } catch (error) {
      console.error("Failed to get admin location suggestions:", error);
      res.status(500).json({ message: "Failed to get location suggestions" });
    }
  });

  // Google Places API Integration Routes
  
  // Status check for Google Places functionality
  app.get("/api/google-places/status", async (req, res) => {
    const status = {
      authenticated: !!req.user,
      apiKeyConfigured: !!process.env.GOOGLE_MAPS_API_KEY,
      ready: !!req.user && !!process.env.GOOGLE_MAPS_API_KEY
    };
    
    res.json(status);
  });
  
  // Search religious places using Google Places API
  app.get("/api/google-places/search", async (req, res) => {
    console.log("🔍 ROUTE HIT: /api/google-places/search");
    console.log("🔍 RAW QUERY:", req.query);
    console.log("🔍 pageToken from query:", req.query.pageToken, typeof req.query.pageToken);
    try {
      // Check authentication first
      if (!req.user) {
        return res.status(401).json({ 
          code: "AUTH_REQUIRED",
          message: "Sign in required to search Google Places"
        });
      }

      // Check API key is configured
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        console.error("Google Maps API key not configured");
        return res.status(500).json({ 
          code: "MISSING_API_KEY",
          message: "Google Maps API key not configured. Please add GOOGLE_MAPS_API_KEY secret."
        });
      }
      
      console.log("Google Places search request:", req.query);
      console.log("Raw pageToken from query:", req.query.pageToken, "Type:", typeof req.query.pageToken);
      
      const searchParams = z.object({
        lat: z.string().transform(Number),
        lng: z.string().transform(Number),
        radius: z.string().transform(Number).optional().default("5000"),
        query: z.string().optional(),
        pageToken: z.string().optional()
      }).parse(req.query);

      // Ensure pageToken is valid or remove it completely
      const validPageToken = searchParams.pageToken && 
                            typeof searchParams.pageToken === 'string' && 
                            searchParams.pageToken.trim() !== '' ? 
                            searchParams.pageToken : undefined;

      console.log("Parsed search params:", searchParams);
      console.log("Valid pageToken:", validPageToken, "Type:", typeof validPageToken);

      let results;
      
      if (searchParams.query) {
        // Text search
        console.log("Performing text search with query:", searchParams.query, "pageToken:", validPageToken);
        results = await googlePlacesService.searchReligiousByText(
          searchParams.query,
          { lat: searchParams.lat, lng: searchParams.lng },
          validPageToken
        );
      } else {
        // Nearby search
        console.log("Performing nearby search with radius:", searchParams.radius, "pageToken:", validPageToken);
        results = await googlePlacesService.searchReligiousPlaces(
          { lat: searchParams.lat, lng: searchParams.lng },
          searchParams.radius,
          validPageToken
        );
      }

      console.log("Google Places search results:", results ? `${results.results?.length || 0} places found${results.next_page_token ? ', more available' : ''}` : "No results");
      res.json(results);
    } catch (error) {
      console.error("Error searching Google Places:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation error details:", error.errors);
        res.status(400).json({ 
          code: "INVALID_PARAMS",
          message: "Invalid search parameters", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          code: "SEARCH_FAILED",
          message: "Failed to search Google Places" 
        });
      }
    }
  });

  // Import selected places from Google Places API
  app.post("/api/google-places/import", isAuthenticated, async (req, res) => {
    try {
      const importSchema = z.object({
        placeIds: z.array(z.string()).min(1).max(100) // Increased limit to handle larger imports
      });
      
      const { placeIds } = importSchema.parse(req.body);
      
      const importedGroups = [];
      const errors = [];
      const skipped = [];
      
      for (const placeId of placeIds) {
        try {
          // Check if place already exists
          if (await storage.checkGooglePlaceExists(placeId)) {
            skipped.push(`Place ${placeId} already exists in database`);
            continue;
          }
          
          // Get detailed place information
          const placeDetails = await googlePlacesService.getPlaceDetails(placeId);
          if (!placeDetails) {
            errors.push(`Failed to get details for place ${placeId}`);
            continue;
          }
          
          // Convert to faith group format
          const faithGroupData = googlePlacesService.convertToFaithGroup(placeDetails, placeDetails);
          
          // Import to database
          const faithGroup = await storage.createFaithGroup(faithGroupData);
          importedGroups.push(faithGroup);
          
        } catch (error) {
          console.error(`Error importing place ${placeId}:`, error);
          errors.push(`Failed to import place ${placeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      res.json({
        imported: importedGroups,
        importedCount: importedGroups.length,
        skippedCount: skipped.length,
        errors: errors.length > 0 ? errors : undefined, // Only include errors if there are actual errors
        totalRequested: placeIds.length
      });
      
    } catch (error) {
      console.error("Error importing from Google Places:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to import from Google Places" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
