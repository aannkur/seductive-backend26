import { Router } from "express";
import {
  saveClientPreferencesController,
  updateClientPreferencesController,
  getClientPreferencesController,
  deleteClientPreferencesController,
} from "../controllers/clientPreferences.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticateUser } from "../middleware/auth.middleware";
import { clientPreferencesSchema } from "../schema/clientPreferences.schema";

const router = Router();

// All routes require authentication
router.post(
  "/",
  authenticateUser,
  validate(clientPreferencesSchema),
  saveClientPreferencesController
);

router.put(
  "/",
  authenticateUser,
  validate(clientPreferencesSchema),
  updateClientPreferencesController
);

router.get("/", authenticateUser, getClientPreferencesController);

router.delete("/", authenticateUser, deleteClientPreferencesController);

export default router;
