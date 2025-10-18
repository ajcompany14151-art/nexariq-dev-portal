// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXTAUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  DATABASE_URL: z.string().default("file:./dev.db"),
  NEXARIQ_BACKEND_URL: z.string().url().default("https://lynxa-pro-backend.vercel.app"),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error("Environment validation failed:", error);
    // Return safe defaults for production
    return {
      NODE_ENV: process.env.NODE_ENV as "development" | "test" | "production" || "development",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
      NEXARIQ_BACKEND_URL: process.env.NEXARIQ_BACKEND_URL || "https://lynxa-pro-backend.vercel.app",
    };
  }
}

export const env = validateEnv();
