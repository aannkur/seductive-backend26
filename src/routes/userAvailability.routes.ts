import { Router } from "express";
import {
  createUserAvailabilityController,
  getUserAvailabilityController,
  getUserAvailabilityByIdController,
  updateUserAvailabilityController,
  deleteUserAvailabilityController,
} from "../controllers/userAvailability.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticateUser } from "../middleware/auth.middleware";
import {
  createUserAvailabilitySchema,
  updateUserAvailabilitySchema,
} from "../schema/userAvailability.schema";

const router = Router();

// All routes require authentication
router.post(
  "/",
  authenticateUser,
  validate(createUserAvailabilitySchema),
  createUserAvailabilityController
);

router.get("/", authenticateUser, getUserAvailabilityController);

router.get("/:id", authenticateUser, getUserAvailabilityByIdController);

router.put(
  "/:id",
  authenticateUser,
  validate(updateUserAvailabilitySchema),
  updateUserAvailabilityController
);

router.delete("/:id", authenticateUser, deleteUserAvailabilityController);

export default router;
