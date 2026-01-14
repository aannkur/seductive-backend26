import { Router } from "express";
import { getAllTagsController } from "../controllers/tag.controller";

const router = Router();

// Get all tags with optional search query parameter
router.get("/", getAllTagsController);

export default router;
