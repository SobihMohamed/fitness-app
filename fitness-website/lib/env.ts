import { z } from "zod";

// Validate public env at runtime (safe to expose)
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_TARGET_URL: z.string().url().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export const env: PublicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_TARGET_URL: process.env.NEXT_PUBLIC_API_TARGET_URL,
});

export const getApiBaseUrl = () => env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
export const getApiTargetUrl = () => env.NEXT_PUBLIC_API_TARGET_URL || env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
