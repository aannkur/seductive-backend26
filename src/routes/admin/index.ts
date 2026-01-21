import { Router } from "express";
import Faq from "./faq.route"

const router = Router();

router.use("/faq", Faq);

export default router;
