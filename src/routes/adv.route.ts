import { Router } from "express";
import { CreateAdController } from "../controllers/ad.controller";
import { validate } from "../middleware/validate.middleware";
import { adSchema } from "../schema/ad.schema";
import { uploadMultipleImages } from "../middleware/upload.middleware";

const router = Router()

router.post("/create-ad",uploadMultipleImages,validate(adSchema),CreateAdController)


export default router