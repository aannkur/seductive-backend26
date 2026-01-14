import { Router } from "express";
import {
  loginController,
  verifyLoginOtpController,
  resendLoginOtpController,
  signupController,
  verifyOtpController,
  resendOtpController,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticateUser } from "../middleware/auth.middleware";
import {
  loginSchema,
  verifyLoginOtpSchema,
  resendLoginOtpSchema,
  signupSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schema/auth.schema";

const router = Router();

// Public routes - no authentication required
router.post("/login", validate(loginSchema), loginController);
router.post(
  "/verify-login-otp",
  validate(verifyLoginOtpSchema),
  verifyLoginOtpController
);
router.post(
  "/resend-login-otp",
  validate(resendLoginOtpSchema),
  resendLoginOtpController
);
router.post("/signup", validate(signupSchema), signupController);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpController);
router.post("/resend-otp", validate(resendOtpSchema), resendOtpController);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController
);

// Protected routes - authentication required
router.post("/logout", authenticateUser, logoutController);

export default router;
