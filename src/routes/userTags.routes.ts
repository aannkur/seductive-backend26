import { Router } from "express";
import {
  addUserTagController,
  removeUserTagController,
  getUserTagsController,
} from "../controllers/userTags.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticateUser } from "../middleware/auth.middleware";
import { addUserTagSchema } from "../schema/userTags.schema";

const router = Router();

// All routes require authentication
router.post(
  "/",
  authenticateUser,
  validate(addUserTagSchema),
  addUserTagController
);

router.get("/", authenticateUser, getUserTagsController);

router.delete("/:tag_id", authenticateUser, removeUserTagController);

export default router;
