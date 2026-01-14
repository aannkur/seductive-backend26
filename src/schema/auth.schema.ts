import { z } from "zod";

// Signup validation schema
export const signupSchema = z.object({
  account_type: z.enum(["Client", "Escort", "Creator", "Admin"] as const, {
    message: "Account type must be one of: Client, Escort, Creator, Admin",
  }),
  display_name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name must not exceed 100 characters")
    .trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must not exceed 100 characters")
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),
  adult_policy: z.boolean().optional().default(true),
});

// Verify OTP validation schema
export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

// Resend OTP validation schema
export const resendOtpSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password must not exceed 100 characters"),
});

// Verify Login OTP validation schema
export const verifyLoginOtpSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

// Resend Login OTP validation schema
export const resendLoginOtpSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

// Forgot Password validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

// Reset Password validation schema
// OTP is required only if old_pass is not provided (forgot password flow)
// If old_pass is provided (change password flow), OTP is optional
export const resetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email format").toLowerCase().trim(),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d+$/, "OTP must contain only digits")
      .optional(),
    new_pass: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
    old_pass: z
      .string()
      .min(8, "Old password must be at least 8 characters")
      .max(100, "Old password must not exceed 100 characters")
      .optional(),
  })
  .refine(
    (data) => {
      // If old_pass is provided, OTP is not required
      // If old_pass is not provided, OTP is required
      if (data.old_pass) {
        return true; // OTP optional when old_pass is provided
      }
      return !!data.otp; // OTP required when old_pass is not provided
    },
    {
      message: "OTP is required when old password is not provided",
      path: ["otp"],
    }
  )
  .refine(
    (data) => {
      // Old password and new password cannot be the same
      if (data.old_pass && data.new_pass) {
        return data.old_pass !== data.new_pass;
      }
      return true; // Skip validation if old_pass is not provided
    },
    {
      message: "Old password and new password cannot be the same",
      path: ["new_pass"],
    }
  );

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyLoginOtpInput = z.infer<typeof verifyLoginOtpSchema>;
export type ResendLoginOtpInput = z.infer<typeof resendLoginOtpSchema>;
