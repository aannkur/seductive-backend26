import { z } from "zod";

// Add User Tag validation schema
export const addUserTagSchema = z.object({
  tag_label: z
    .string()
    .min(1, "Tag label is required")
    .max(100, "Tag label must not exceed 100 characters")
    .trim(),
  tag_description: z
    .string()
    .max(500, "Tag description must not exceed 500 characters")
    .trim()
    .optional()
    .nullable(),
  tag_type: z
    .enum(["profile", "content"], {
      message: "Tag type must be either 'profile' or 'content'",
    })
    .optional()
    .default("profile"),
});

// Remove User Tag validation schema
export const removeUserTagSchema = z.object({
  tag_id: z
    .number({
      message: "Tag ID is required",
    })
    .int({
      message: "Tag ID must be an integer",
    })
    .positive({
      message: "Tag ID must be a positive number",
    }),
});

// Type exports
export type AddUserTagInput = z.infer<typeof addUserTagSchema>;
export type RemoveUserTagInput = z.infer<typeof removeUserTagSchema>;
