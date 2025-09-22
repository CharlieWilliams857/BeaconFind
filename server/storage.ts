import { type FaithGroup, type InsertFaithGroup, type SearchFaithGroupsParams, faithGroups, users, type User, type UpsertUser, reviews, type Review, type InsertReview } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, sql, and, desc, avg, count } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Faith Groups
  getFaithGroup(id: string): Promise<FaithGroup | undefined>;
  getFaithGroups(): Promise<FaithGroup[]>;
  searchFaithGroups(params: SearchFaithGroupsParams): Promise<FaithGroup[]>;
  createFaithGroup(faithGroup: InsertFaithGroup): Promise<FaithGroup>;
  updateFaithGroup(id: string, faithGroup: Partial<InsertFaithGroup>): Promise<FaithGroup | undefined>;
  deleteFaithGroup(id: string): Promise<boolean>;
  
  // Reviews
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByFaithGroup(faithGroupId: string): Promise<(Review & { user: User })[]>;
  getReviewsByUser(userId: string): Promise<(Review & { faithGroup: FaithGroup })[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  updateFaithGroupRating(faithGroupId: string): Promise<void>;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export class MemStorage implements IStorage {
  private faithGroups: Map<string, FaithGroup>;
  private users: Map<string, User>;
  private reviews: Map<string, Review>;

  constructor() {
    this.faithGroups = new Map();
    this.users = new Map();
    this.reviews = new Map();
    
    // Initialize with sample data for demonstration
    this.initializeSampleData();
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      id: userData.id || randomUUID(),
      createdAt: this.users.get(userData.id!)?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  private initializeSampleData() {
    const sampleGroups: InsertFaithGroup[] = [
      {
        name: "Grace Community Church",
        religion: "Christianity",
        denomination: "Non-denominational Christian",
        description: "A welcoming community focused on worship, fellowship, and serving our neighborhood. We offer services in multiple languages and have active youth programs.",
        longDescription: "Grace Community Church is a welcoming, diverse community of believers committed to following Jesus Christ. We believe in the transformative power of God's love and seek to share that love with our neighborhood and beyond. Our congregation includes people from all walks of life, and we pride ourselves on being an inclusive, family-friendly community where everyone can grow in their faith journey.",
        address: "1234 Mission Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94103",
        latitude: "37.7749",
        longitude: "-122.4194",
        phone: "(415) 555-0123",
        email: "info@gracecommunitysf.org",
        website: "www.gracecommunitysf.org",
        serviceTimes: JSON.stringify([
          { day: "Sunday Morning", time: "9:00 AM & 11:00 AM" },
          { day: "Wednesday Evening", time: "7:00 PM" },
          { day: "Bible Study", time: "Saturday 10:00 AM" }
        ]),
        isOpen: "open"
      },
      {
        name: "St. Mary's Catholic Church",
        religion: "Christianity",
        denomination: "Roman Catholic",
        description: "Historic parish serving the community for over 100 years. Daily masses, confession, and various ministries for all ages.",
        longDescription: "St. Mary's Catholic Church has been a cornerstone of the San Francisco community for over a century. We offer traditional Catholic worship, daily masses, and a variety of ministries including youth programs, senior outreach, and community service initiatives.",
        address: "567 California Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94108",
        latitude: "37.7849",
        longitude: "-122.4094",
        phone: "(415) 555-0156",
        email: "parish@stmarysSF.org",
        website: "www.stmarysSF.org",
        serviceTimes: JSON.stringify([
          { day: "Sunday Mass", time: "8:00 AM, 10:00 AM, 12:00 PM" },
          { day: "Daily Mass", time: "7:00 AM, 5:30 PM" },
          { day: "Confession", time: "Saturday 3:00-4:00 PM" }
        ]),
        isOpen: "open"
      },
      {
        name: "Temple Beth Shalom",
        religion: "Judaism",
        denomination: "Conservative Judaism",
        description: "Vibrant Jewish community offering traditional and contemporary services, Hebrew school, and cultural programs.",
        longDescription: "Temple Beth Shalom is a warm and welcoming Conservative Jewish congregation serving the Bay Area for over 50 years. We combine traditional Jewish values with contemporary approaches to worship, learning, and community building.",
        address: "890 Fillmore Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94115",
        latitude: "37.7849",
        longitude: "-122.4324",
        phone: "(415) 555-0234",
        email: "info@bethshalomsf.org",
        website: "www.bethshalomsf.org",
        serviceTimes: JSON.stringify([
          { day: "Friday Evening", time: "6:30 PM" },
          { day: "Saturday Morning", time: "10:00 AM" },
          { day: "Hebrew School", time: "Sunday 9:00 AM" }
        ]),
        isOpen: "open"
      },
      {
        name: "Islamic Center of San Francisco",
        religion: "Islam",
        denomination: "Sunni Islam",
        description: "Community mosque providing daily prayers, Friday services, Islamic education, and community events.",
        longDescription: "The Islamic Center of San Francisco serves as a spiritual home for Muslims in the Bay Area. We offer daily prayers, educational programs, community outreach, and work to build bridges between different faith communities.",
        address: "456 Geary Boulevard",
        city: "San Francisco", 
        state: "CA",
        zipCode: "94118",
        latitude: "37.7849",
        longitude: "-122.4644",
        phone: "(415) 555-0345",
        email: "info@islamiccentersf.org",
        website: "www.islamiccentersf.org",
        serviceTimes: JSON.stringify([
          { day: "Friday Prayer", time: "1:00 PM" },
          { day: "Daily Prayers", time: "5 times daily" },
          { day: "Islamic Classes", time: "Saturday 10:00 AM" }
        ]),
        isOpen: "open"
      },
      {
        name: "Buddhist Meditation Center",
        religion: "Buddhism",
        denomination: "Zen Buddhism",
        description: "Peaceful meditation center offering guided meditation, dharma talks, and mindfulness workshops.",
        longDescription: "Our Buddhist Meditation Center provides a serene space for practice and learning. We welcome practitioners of all levels and offer instruction in Zen meditation, dharma study, and mindful living principles.",
        address: "789 Pine Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94108",
        latitude: "37.7889",
        longitude: "-122.4094",
        phone: "(415) 555-0456",
        email: "info@buddhismcentersf.org",
        website: "www.buddhismcentersf.org",
        serviceTimes: JSON.stringify([
          { day: "Morning Meditation", time: "Daily 7:00 AM" },
          { day: "Evening Sit", time: "Daily 6:00 PM" },
          { day: "Dharma Talk", time: "Sunday 10:00 AM" }
        ]),
        isOpen: "open"
      }
    ];

    sampleGroups.forEach(group => {
      this.createFaithGroup(group);
    });
  }

  async getFaithGroup(id: string): Promise<FaithGroup | undefined> {
    return this.faithGroups.get(id);
  }

  async getFaithGroups(): Promise<FaithGroup[]> {
    return Array.from(this.faithGroups.values());
  }

  async searchFaithGroups(params: SearchFaithGroupsParams): Promise<FaithGroup[]> {
    let results = Array.from(this.faithGroups.values());

    // Filter by religion if specified
    if (params.religion) {
      const religionLower = params.religion.toLowerCase();
      results = results.filter(group => 
        group.religion.toLowerCase().includes(religionLower) ||
        group.denomination?.toLowerCase().includes(religionLower) ||
        group.name.toLowerCase().includes(religionLower) ||
        group.description.toLowerCase().includes(religionLower)
      );
    }

    // Filter by location/radius if coordinates provided
    if (params.latitude && params.longitude) {
      results = results.filter(group => {
        const distance = calculateDistance(
          params.latitude!,
          params.longitude!,
          parseFloat(group.latitude),
          parseFloat(group.longitude)
        );
        return distance <= params.radius;
      });

      // Sort by distance
      results.sort((a, b) => {
        const distanceA = calculateDistance(
          params.latitude!,
          params.longitude!,
          parseFloat(a.latitude),
          parseFloat(a.longitude)
        );
        const distanceB = calculateDistance(
          params.latitude!,
          params.longitude!,
          parseFloat(b.latitude),
          parseFloat(b.longitude)
        );
        return distanceA - distanceB;
      });
    }

    // Add distance property to results for display
    if (params.latitude && params.longitude) {
      results = results.map(group => ({
        ...group,
        distance: calculateDistance(
          params.latitude!,
          params.longitude!,
          parseFloat(group.latitude),
          parseFloat(group.longitude)
        )
      })) as FaithGroup[];
    }

    return results;
  }

  async createFaithGroup(insertFaithGroup: InsertFaithGroup): Promise<FaithGroup> {
    const id = randomUUID();
    const faithGroup: FaithGroup = { 
      ...insertFaithGroup,
      id,
      rating: "0.0",
      reviewCount: 0,
      email: insertFaithGroup.email || null,
      phone: insertFaithGroup.phone || null,
      website: insertFaithGroup.website || null,
      denomination: insertFaithGroup.denomination || null,
      longDescription: insertFaithGroup.longDescription || null,
      serviceTimes: insertFaithGroup.serviceTimes || null,
      isOpen: insertFaithGroup.isOpen || null
    };
    this.faithGroups.set(id, faithGroup);
    return faithGroup;
  }

  async updateFaithGroup(id: string, updateData: Partial<InsertFaithGroup>): Promise<FaithGroup | undefined> {
    const existing = this.faithGroups.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updateData };
    this.faithGroups.set(id, updated);
    return updated;
  }

  async deleteFaithGroup(id: string): Promise<boolean> {
    return this.faithGroups.delete(id);
  }

  // Review operations (in-memory implementation)
  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByFaithGroup(faithGroupId: string): Promise<(Review & { user: User })[]> {
    const groupReviews = Array.from(this.reviews.values())
      .filter(review => review.faithGroupId === faithGroupId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return groupReviews
      .map(review => {
        const user = this.users.get(review.userId);
        return user ? { ...review, user } : null;
      })
      .filter((review): review is Review & { user: User } => review !== null);
  }

  async getReviewsByUser(userId: string): Promise<(Review & { faithGroup: FaithGroup })[]> {
    const userReviews = Array.from(this.reviews.values())
      .filter(review => review.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return userReviews
      .map(review => {
        const faithGroup = this.faithGroups.get(review.faithGroupId);
        return faithGroup ? { ...review, faithGroup } : null;
      })
      .filter((review): review is Review & { faithGroup: FaithGroup } => review !== null);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    // Validate that user and faith group exist
    const user = this.users.get(insertReview.userId);
    const faithGroup = this.faithGroups.get(insertReview.faithGroupId);
    
    if (!user) {
      throw new Error(`User with id ${insertReview.userId} not found`);
    }
    if (!faithGroup) {
      throw new Error(`Faith group with id ${insertReview.faithGroupId} not found`);
    }

    const review: Review = {
      ...insertReview,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.set(review.id, review);
    await this.updateFaithGroupRating(insertReview.faithGroupId);
    return review;
  }

  async updateReview(id: string, updateData: Partial<InsertReview>): Promise<Review | undefined> {
    const existing = this.reviews.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updateData, updatedAt: new Date() };
    this.reviews.set(id, updated);
    await this.updateFaithGroupRating(updated.faithGroupId);
    return updated;
  }

  async deleteReview(id: string): Promise<boolean> {
    const review = this.reviews.get(id);
    if (!review) return false;
    
    const deleted = this.reviews.delete(id);
    if (deleted) {
      await this.updateFaithGroupRating(review.faithGroupId);
    }
    return deleted;
  }

  async updateFaithGroupRating(faithGroupId: string): Promise<void> {
    const groupReviews = Array.from(this.reviews.values())
      .filter(review => review.faithGroupId === faithGroupId);
    
    const faithGroup = this.faithGroups.get(faithGroupId);
    if (!faithGroup) return;

    if (groupReviews.length === 0) {
      faithGroup.rating = "0.0";
      faithGroup.reviewCount = 0;
    } else {
      const avgRating = groupReviews.reduce((sum, review) => sum + review.rating, 0) / groupReviews.length;
      faithGroup.rating = avgRating.toFixed(1);
      faithGroup.reviewCount = groupReviews.length;
    }
    
    this.faithGroups.set(faithGroupId, faithGroup);
  }
}

// Database implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getFaithGroup(id: string): Promise<FaithGroup | undefined> {
    const [faithGroup] = await db.select().from(faithGroups).where(eq(faithGroups.id, id));
    return faithGroup || undefined;
  }

  async getFaithGroups(): Promise<FaithGroup[]> {
    return await db.select().from(faithGroups);
  }

  async searchFaithGroups(params: SearchFaithGroupsParams): Promise<FaithGroup[]> {
    let query = db.select().from(faithGroups);

    // Filter by religion if specified
    if (params.religion) {
      const religionPattern = `%${params.religion}%`;
      query = query.where(
        sql`(
          ${faithGroups.religion} ILIKE ${religionPattern} OR
          ${faithGroups.denomination} ILIKE ${religionPattern} OR
          ${faithGroups.name} ILIKE ${religionPattern} OR
          ${faithGroups.description} ILIKE ${religionPattern}
        )`
      );
    }

    let results = await query;

    // Filter by location/radius using Haversine formula in application layer
    if (params.latitude && params.longitude) {
      results = results.filter(group => {
        const distance = calculateDistance(
          params.latitude!,
          params.longitude!,
          parseFloat(group.latitude),
          parseFloat(group.longitude)
        );
        return distance <= params.radius;
      });

      // Add distance property and sort by distance
      results = results.map(group => ({
        ...group,
        distance: calculateDistance(
          params.latitude!,
          params.longitude!,
          parseFloat(group.latitude),
          parseFloat(group.longitude)
        )
      })) as FaithGroup[];

      results.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
    }

    return results;
  }

  async createFaithGroup(insertFaithGroup: InsertFaithGroup): Promise<FaithGroup> {
    const [faithGroup] = await db
      .insert(faithGroups)
      .values(insertFaithGroup)
      .returning();
    return faithGroup;
  }

  async updateFaithGroup(id: string, updateData: Partial<InsertFaithGroup>): Promise<FaithGroup | undefined> {
    const [updated] = await db
      .update(faithGroups)
      .set(updateData)
      .where(eq(faithGroups.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFaithGroup(id: string): Promise<boolean> {
    const result = await db
      .delete(faithGroups)
      .where(eq(faithGroups.id, id))
      .returning();
    return result.length > 0;
  }

  // Review operations
  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async getReviewsByFaithGroup(faithGroupId: string): Promise<(Review & { user: User })[]> {
    const results = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        faithGroupId: reviews.faithGroupId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.faithGroupId, faithGroupId))
      .orderBy(desc(reviews.createdAt));
    
    return results.map(row => ({
      ...row,
      user: row.user!
    })) as (Review & { user: User })[];
  }

  async getReviewsByUser(userId: string): Promise<(Review & { faithGroup: FaithGroup })[]> {
    const results = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        faithGroupId: reviews.faithGroupId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        faithGroup: {
          id: faithGroups.id,
          name: faithGroups.name,
          religion: faithGroups.religion,
          denomination: faithGroups.denomination,
          description: faithGroups.description,
          longDescription: faithGroups.longDescription,
          address: faithGroups.address,
          city: faithGroups.city,
          state: faithGroups.state,
          zipCode: faithGroups.zipCode,
          latitude: faithGroups.latitude,
          longitude: faithGroups.longitude,
          phone: faithGroups.phone,
          email: faithGroups.email,
          website: faithGroups.website,
          rating: faithGroups.rating,
          reviewCount: faithGroups.reviewCount,
          serviceTimes: faithGroups.serviceTimes,
          isOpen: faithGroups.isOpen,
        }
      })
      .from(reviews)
      .leftJoin(faithGroups, eq(reviews.faithGroupId, faithGroups.id))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));

    return results.map(row => ({
      ...row,
      faithGroup: row.faithGroup!
    })) as (Review & { faithGroup: FaithGroup })[];
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    
    // Update faith group rating after creating review
    await this.updateFaithGroupRating(insertReview.faithGroupId);
    
    return review;
  }

  async updateReview(id: string, updateData: Partial<InsertReview>): Promise<Review | undefined> {
    const [updated] = await db
      .update(reviews)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    
    if (updated) {
      // Update faith group rating after updating review
      await this.updateFaithGroupRating(updated.faithGroupId);
    }
    
    return updated || undefined;
  }

  async deleteReview(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning();
    
    if (deleted) {
      // Update faith group rating after deleting review
      await this.updateFaithGroupRating(deleted.faithGroupId);
    }
    
    return !!deleted;
  }

  async updateFaithGroupRating(faithGroupId: string): Promise<void> {
    // Calculate average rating and count
    const [result] = await db
      .select({
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id)
      })
      .from(reviews)
      .where(eq(reviews.faithGroupId, faithGroupId));

    const newRating = result.avgRating ? parseFloat(result.avgRating).toFixed(1) : "0.0";
    const newReviewCount = result.reviewCount || 0;

    // Update faith group with new rating and count
    await db
      .update(faithGroups)
      .set({
        rating: newRating,
        reviewCount: newReviewCount
      })
      .where(eq(faithGroups.id, faithGroupId));
  }

  // Initialize database with sample data if empty
  async initializeSampleData(): Promise<void> {
    const existingGroups = await this.getFaithGroups();
    if (existingGroups.length > 0) {
      return; // Already has data
    }

    const sampleGroups: InsertFaithGroup[] = [
      {
        name: "Grace Community Church",
        religion: "Christianity",
        denomination: "Non-denominational Christian",
        description: "A welcoming community focused on worship, fellowship, and serving our neighborhood. We offer services in multiple languages and have active youth programs.",
        longDescription: "Grace Community Church is a welcoming, diverse community of believers committed to following Jesus Christ. We believe in the transformative power of God's love and seek to share that love with our neighborhood and beyond. Our congregation includes people from all walks of life, and we pride ourselves on being an inclusive, family-friendly community where everyone can grow in their faith journey.",
        address: "1234 Mission Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94103",
        latitude: "37.7749",
        longitude: "-122.4194",
        phone: "(415) 555-0123",
        email: "info@gracecommunitysf.org",
        website: "www.gracecommunitysf.org",
        serviceTimes: JSON.stringify([
          { day: "Sunday Morning", time: "9:00 AM & 11:00 AM" },
          { day: "Wednesday Evening", time: "7:00 PM" },
          { day: "Bible Study", time: "Saturday 10:00 AM" }
        ]),
        isOpen: "open"
      },
      {
        name: "St. Mary's Catholic Church",
        religion: "Christianity",
        denomination: "Roman Catholic",
        description: "Historic parish serving the community for over 100 years. Daily masses, confession, and various ministries for all ages.",
        longDescription: "St. Mary's Catholic Church has been a cornerstone of the San Francisco community for over a century. We offer traditional Catholic worship, daily masses, and a variety of ministries including youth programs, senior outreach, and community service initiatives.",
        address: "567 California Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94108",
        latitude: "37.7849",
        longitude: "-122.4094",
        phone: "(415) 555-0156",
        email: "parish@stmarysSF.org",
        website: "www.stmarysSF.org",
        serviceTimes: JSON.stringify([
          { day: "Sunday Mass", time: "8:00 AM, 10:00 AM, 12:00 PM" },
          { day: "Daily Mass", time: "7:00 AM, 5:30 PM" },
          { day: "Confession", time: "Saturday 3:00-4:00 PM" }
        ]),
        isOpen: "open"
      },
      {
        name: "Temple Beth Shalom",
        religion: "Judaism",
        denomination: "Conservative Judaism",
        description: "Vibrant Jewish community offering traditional and contemporary services, Hebrew school, and cultural programs.",
        longDescription: "Temple Beth Shalom is a warm and welcoming Conservative Jewish congregation serving the Bay Area for over 50 years. We combine traditional Jewish values with contemporary approaches to worship, learning, and community building.",
        address: "890 Fillmore Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94115",
        latitude: "37.7849",
        longitude: "-122.4324",
        phone: "(415) 555-0234",
        email: "info@bethshalomsf.org",
        website: "www.bethshalomsf.org",
        serviceTimes: JSON.stringify([
          { day: "Friday Evening", time: "6:30 PM" },
          { day: "Saturday Morning", time: "10:00 AM" },
          { day: "Hebrew School", time: "Sunday 9:00 AM" }
        ]),
        isOpen: "open"
      },
      {
        name: "Islamic Center of San Francisco",
        religion: "Islam",
        denomination: "Sunni Islam",
        description: "Community mosque providing daily prayers, Friday services, Islamic education, and community events.",
        longDescription: "The Islamic Center of San Francisco serves as a spiritual home for Muslims in the Bay Area. We offer daily prayers, educational programs, community outreach, and work to build bridges between different faith communities.",
        address: "456 Geary Boulevard",
        city: "San Francisco", 
        state: "CA",
        zipCode: "94118",
        latitude: "37.7849",
        longitude: "-122.4644",
        phone: "(415) 555-0345",
        email: "info@islamiccentersf.org",
        website: "www.islamiccentersf.org",
        serviceTimes: JSON.stringify([
          { day: "Friday Prayer", time: "1:00 PM" },
          { day: "Daily Prayers", time: "5 times daily" },
          { day: "Islamic Classes", time: "Saturday 10:00 AM" }
        ]),
        isOpen: "open"
      },
      {
        name: "Buddhist Meditation Center",
        religion: "Buddhism",
        denomination: "Zen Buddhism",
        description: "Peaceful meditation center offering guided meditation, dharma talks, and mindfulness workshops.",
        longDescription: "Our Buddhist Meditation Center provides a serene space for practice and learning. We welcome practitioners of all levels and offer instruction in Zen meditation, dharma study, and mindful living principles.",
        address: "789 Pine Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94108",
        latitude: "37.7889",
        longitude: "-122.4094",
        phone: "(415) 555-0456",
        email: "info@buddhismcentersf.org",
        website: "www.buddhismcentersf.org",
        serviceTimes: JSON.stringify([
          { day: "Morning Meditation", time: "Daily 7:00 AM" },
          { day: "Evening Sit", time: "Daily 6:00 PM" },
          { day: "Dharma Talk", time: "Sunday 10:00 AM" }
        ]),
        isOpen: "open"
      }
    ];

    for (const group of sampleGroups) {
      const [faithGroup] = await db
        .insert(faithGroups)
        .values({
          ...group,
          rating: "4.5",
          reviewCount: Math.floor(Math.random() * 200) + 10
        })
        .returning();
    }
  }
}

// Create storage instance with fallback to in-memory storage
let storage: IStorage;

try {
  if (process.env.DATABASE_URL) {
    const databaseStorage = new DatabaseStorage();
    // Initialize sample data when storage is created
    databaseStorage.initializeSampleData().catch(console.error);
    storage = databaseStorage;
  } else {
    console.warn('DATABASE_URL not found, falling back to in-memory storage');
    storage = new MemStorage();
  }
} catch (error) {
  console.error('Failed to initialize database storage, falling back to in-memory storage:', error);
  storage = new MemStorage();
}

export { storage };
