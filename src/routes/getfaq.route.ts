import { Router } from "express";
import { getFaqController } from "../controllers/getFaq.controller";

const router = Router()

router.get("/",getFaqController)

export default router;