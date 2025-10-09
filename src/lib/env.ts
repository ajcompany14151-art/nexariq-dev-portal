// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  NEXARIQ_BACKEND_URL: z.string().url().default("https://lynxa-pro-backend.vercel.app"),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  return envSchema.parse(process.env);
}

export const env = validateEnv();
