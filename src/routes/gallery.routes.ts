import { Router, Request, Response, NextFunction } from "express";
import { authenticateUser } from "../middleware/auth.middleware";
import { uploadMultipleImages } from "../middleware/upload.middleware";
import { multerErrorHandler } from "../middleware/multerError.middleware";
import { uploadGalleryImagesController } from "../controllers/gallery.controller";

const router = Router();

// Wrapper to catch multer errors
const handleMulterUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadMultipleImages(req, res, (err) => {
    if (err) {
      return multerErrorHandler(err, req, res, next);
    }
    next();
  });
};

// Upload gallery images (multiple)
router.post(
  "/upload",
  authenticateUser,
  handleMulterUpload,
  uploadGalleryImagesController
);

export default router;
