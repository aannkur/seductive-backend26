import { z } from "zod";

export const contactUsSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(150, "Full name must not exceed 150 characters")
    .trim(),

  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  help_topic: z
    .string()
    .min(2, "Help topic is required")
    .max(200, "Help topic must not exceed 200 characters")
    .trim(),

  message: z
    .string()
    .min(5, "Message must be at least 5 characters")
    .trim(),
});

export type ContactUsInput = z.infer<typeof contactUsSchema>;
