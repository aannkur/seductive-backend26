import { z } from "zod";

// Valid vibe preferences
const VALID_PREFERENCES = [
  "GFE",
  "Sophisticated",
  "Wild nights",
  "Chilled",
  "Luxury",
  "Incall",
  "Outcall",
] as const;

// Client Preferences validation schema
export const clientPreferencesSchema = z.object({
  city: z
    .string()
    .max(100, "City must not exceed 100 characters")
    .trim()
    .optional()
    .nullable(),
  preferences: z
    .array(z.enum(VALID_PREFERENCES))
    .max(7, "Maximum 7 preferences allowed")
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(1000, "Bio must not exceed 1000 characters")
    .trim()
    .optional()
    .nullable(),
  tags: z
    .array(
      z
        .string()
        .min(1, "Tag cannot be empty")
        .max(50, "Tag must not exceed 50 characters")
    )
    .max(20, "Maximum 20 tags allowed")
    .optional()
    .nullable(),
});

// Type export
export type ClientPreferencesInput = z.infer<typeof clientPreferencesSchema>;
