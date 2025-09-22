import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const faithGroups = pgTable("faith_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  religion: text("religion").notNull(),
  denomination: text("denomination"),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  serviceTimes: text("service_times"), // JSON string
  isOpen: text("is_open").default("unknown"), // "open", "closed", "unknown"
});

export const insertFaithGroupSchema = createInsertSchema(faithGroups).omit({
  id: true,
  rating: true,
  reviewCount: true,
});

export const searchFaithGroupsSchema = z.object({
  religion: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().default(10), // miles
});

export type InsertFaithGroup = z.infer<typeof insertFaithGroupSchema>;
export type FaithGroup = typeof faithGroups.$inferSelect;
export type SearchFaithGroupsParams = z.infer<typeof searchFaithGroupsSchema>;

// Popular religion categories
// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)  
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export const RELIGIONS = [
  "Christianity",
  "Judaism", 
  "Islam",
  "Hinduism",
  "Buddhism",
  "Other"
] as const;
