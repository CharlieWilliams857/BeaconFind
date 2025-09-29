# Beacon - Faith Community Finder

## Overview

Beacon is a modern web application designed to help people discover and connect with faith communities in their area. The platform allows users to search for churches, temples, mosques, and other religious organizations by faith tradition, location, and proximity. Built with a React frontend and Express backend, the application provides an intuitive interface for browsing faith groups, viewing detailed information, and finding nearby communities through interactive maps.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **Development**: TSX for TypeScript execution in development mode
- **Data Layer**: In-memory storage implementation with interface-based design for future database integration
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)

### API Design
- **REST Endpoints**: Standardized endpoints for faith group operations
  - GET `/api/faith-groups` - Retrieve all faith groups
  - GET `/api/faith-groups/search` - Search with filtering by religion, location, and radius
  - GET `/api/faith-groups/:id` - Get specific faith group details
  - POST `/api/faith-groups` - Create new faith group
  - PUT `/api/faith-groups/:id` - Update existing faith group
  - DELETE `/api/faith-groups/:id` - Remove faith group
  - POST `/api/scrape-website` - Extract church data from website URL (authenticated)
- **Validation**: Zod schemas for request/response validation and type inference
- **Error Handling**: Centralized error handling with appropriate HTTP status codes

### Data Schema
- **Faith Groups Model**: Comprehensive schema including basic information (name, religion, denomination), location data (address, coordinates), contact details, and user engagement metrics (ratings, reviews)
- **Search Parameters**: Flexible filtering by religion type, geographic location, and proximity radius
- **Geolocation**: Decimal precision coordinates for accurate distance calculations using Haversine formula

### Frontend Pages and Components
- **Home Page**: Hero section with search functionality and category browsing
- **Search Results**: Filterable list view with map integration for geographic visualization
- **Detail View**: Comprehensive faith group information with contact details and directions
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Development Tools
- **Type Safety**: Shared TypeScript types between frontend and backend via shared schema
- **Code Quality**: ESLint and TypeScript compiler checks
- **Hot Reload**: Vite HMR for instant development feedback
- **Path Aliases**: Configured import aliases for clean code organization

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon cloud database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **drizzle-kit**: Database migration and schema management tooling

### UI and Styling
- **@radix-ui/react-\***: Comprehensive collection of accessible UI primitives (dialogs, dropdowns, navigation, form controls)
- **tailwindcss**: Utility-first CSS framework with PostCSS integration
- **class-variance-authority**: Type-safe component variant management
- **lucide-react**: Modern icon library with consistent design

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management with caching, background updates, and optimistic updates
- **wouter**: Lightweight routing library for single-page application navigation

### Form Handling and Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration layer for validation schema resolvers
- **zod**: Schema validation library for runtime type checking and form validation

### Mapping and Geolocation
- **leaflet**: Interactive map library for location visualization
- **@types/leaflet**: TypeScript definitions for Leaflet integration

### Development and Build Tools
- **vite**: Fast build tool with ES modules and hot module replacement
- **@vitejs/plugin-react**: Vite plugin for React support with Fast Refresh
- **@replit/vite-plugin-\***: Replit-specific development enhancements (error overlay, dev banner, cartographer)
- **esbuild**: Fast JavaScript bundler for production builds

### Utility Libraries
- **date-fns**: Modern date utility library for date formatting and manipulation
- **clsx** and **tailwind-merge**: Utility functions for conditional CSS class management
- **nanoid**: Secure URL-safe unique ID generator
- **cheerio**: HTML parsing library for website data extraction
- **axios**: HTTP client for fetching website content

## Recent Changes

### Website Data Extraction Feature (September 29, 2025)
Added automated website scraping functionality to extract church information from their websites:

**Backend Components**:
- `server/website-scraper.ts` - HTML parsing module using Cheerio to extract structured data
- Extracts: church name, description, phone, email, address, denomination, service times, pastor information
- Uses pattern matching and keyword detection to identify relevant content
- POST `/api/scrape-website` endpoint with authentication requirement

**Frontend Components**:
- New "Extract Data from Church Website" section on Google Places Import page (`/admin/google-places`)
- URL input field with validation
- Real-time data extraction with loading states
- Preview display of extracted data before manual database entry

**Authentication Fix**:
- Updated `isAuthenticated` middleware to support both Replit Auth and email/password authentication
- Resolves issue where email/password users couldn't access protected endpoints

**Technical Notes**:
- Free solution using Cheerio (no API keys required)
- Handles JavaScript-free websites well
- Can be upgraded to services like ScrapingBee for JavaScript-heavy sites
- Security consideration: SSRF risk with user-supplied URLs (admin-only access mitigates risk)