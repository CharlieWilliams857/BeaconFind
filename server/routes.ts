import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchFaithGroupsSchema, insertFaithGroupSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
        'new york': { lat: 40.7128, lng: -74.0060 },
        'los angeles': { lat: 34.0522, lng: -118.2437 },
        'chicago': { lat: 41.8781, lng: -87.6298 },
        'houston': { lat: 29.7604, lng: -95.3698 },
      };

      const normalizedLocation = location.toLowerCase();
      const coords = mockCoordinates[normalizedLocation] || mockCoordinates['san francisco'];

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

  const httpServer = createServer(app);
  return httpServer;
}
