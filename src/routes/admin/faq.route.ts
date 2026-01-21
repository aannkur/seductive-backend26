import {Router} from "express"
import { validate } from "../../middleware/validate.middleware"
import { faqSchema } from "../../schema/faq.schema"
import { createFaqController, deleteFaqController } from "../../controllers/admin/faq.controller"
import { adminOnly } from "../../middleware/admin.middleware"
import { authenticateUser } from "../../middleware/auth.middleware"


const router =  Router()

// admin create Faq
router.post("/create-faq",authenticateUser,adminOnly,validate(faqSchema),createFaqController)
// admin update faq
router.put("/update-faq/:id",authenticateUser,adminOnly,validate(faqSchema),createFaqController)
// admin delete faq
router.delete("/delete/:id",authenticateUser,adminOnly,deleteFaqController)


export default router