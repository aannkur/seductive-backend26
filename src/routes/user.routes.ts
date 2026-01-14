import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware";
import {
  updateUserProfileController,
  getUserProfileController,
} from "../controllers/user.controller";

const router = Router();

// Get user profile
router.get("/", authenticateUser, getUserProfileController);

// Update user profile (supports partial updates)
router.put("/", authenticateUser, updateUserProfileController);

export default router;
