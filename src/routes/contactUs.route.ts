import { Router } from "express";
import {
  createContactUsController
} from "../controllers/contactUs.controller";
import { validate } from "../middleware/validate.middleware";
import { contactUsSchema } from "../schema/contactUs.schema";

const router = Router();

// Create contact us message
router.post(
  "/",
  validate(contactUsSchema),
  createContactUsController
);

export default router;
