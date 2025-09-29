// Integration reference: blueprint:javascript_auth_all_persistance
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import type { Express, Request, Response, NextFunction } from "express";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function getUserByEmail(email: string) {
  return await storage.getUserByEmail(email);
}

async function createUserWithPassword(userData: RegisterData) {
  const hashedPassword = await hashPassword(userData.password);
  
  return await storage.createUser({
    email: userData.email,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    faith: userData.faith,
    location: userData.location,
    userType: userData.userType,
    faithPractice: userData.faithPractice,
  });
}

export function setupEmailAuth(app: Express) {
  // Email/password login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: validationResult.error.errors 
        });
      }

      const { email, password } = validationResult.data;
      
      const user = await getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set user session (compatible with existing session structure)
      (req.session as any).passport = { user: user.id };
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Authentication failed" });
        }
        
        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Email/password registration endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: validationResult.error.errors 
        });
      }

      const userData = validationResult.data;
      
      // Check if user already exists
      const existingUser = await getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create user with hashed password
      const user = await createUserWithPassword(userData);
      
      // Set user session
      (req.session as any).passport = { user: user.id };
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Registration failed" });
        }
        
        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}