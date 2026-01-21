import { Router } from "express";
import { NewsLetterController } from "../controllers/NewsLetterController";
import { validate } from "../middleware/validate.middleware";
import { NewsLetterschema } from "../schema/newsLetter.schema";

const router = Router();

router.post("/",validate(NewsLetterschema),NewsLetterController);

export default router;