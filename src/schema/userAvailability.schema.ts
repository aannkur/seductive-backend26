import { z } from "zod";

// Valid days of week
const VALID_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Time format regex (HH:MM or HH:MM:SS)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;

// Create User Availability validation schema
export const createUserAvailabilitySchema = z.object({
  days_of_week: z.enum(VALID_DAYS, {
    message:
      "Days of week must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday",
  }),
  start_time: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM or HH:MM:SS")
    .refine(
      (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      },
      { message: "Invalid time value" }
    ),
  end_time: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM or HH:MM:SS")
    .refine(
      (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      },
      { message: "Invalid time value" }
    ),
});

// Update User Availability validation schema
export const updateUserAvailabilitySchema = z.object({
  days_of_week: z
    .enum(VALID_DAYS, {
      message:
        "Days of week must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday",
    })
    .optional(),
  start_time: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM or HH:MM:SS")
    .refine(
      (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      },
      { message: "Invalid time value" }
    )
    .optional(),
  end_time: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM or HH:MM:SS")
    .refine(
      (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      },
      { message: "Invalid time value" }
    )
    .optional(),
});

// Type exports
export type CreateUserAvailabilityInput = z.infer<
  typeof createUserAvailabilitySchema
>;
export type UpdateUserAvailabilityInput = z.infer<
  typeof updateUserAvailabilitySchema
>;
