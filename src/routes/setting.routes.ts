import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { updateGeneralSettingsSchema } from "../schema/setting.schema";
import { genralController } from "../controllers/setting.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router()


router.put("/general",validate(updateGeneralSettingsSchema),authenticateUser,genralController)

export default router;