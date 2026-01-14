import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "../constants/messages";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to accept images and videos
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check if file is an image or video
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error(MESSAGES.ONLY_IMAGE_VIDEO_ALLOWED));
  }
};

// Custom file size limit based on file type
const getFileSizeLimit = (file: Express.Multer.File): number => {
  if (file.mimetype.startsWith("image/")) {
    return 10 * 1024 * 1024; // 10MB for images
  }
  if (file.mimetype.startsWith("video/")) {
    return 100 * 1024 * 1024; // 100MB for videos
  }
  return 10 * 1024 * 1024; // Default to 10MB
};

// Multer configuration with higher limit for videos
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (for videos), actual limit checked per file
    files: 10, // Maximum 10 files per request
  },
});

// Middleware wrapper to check file size limits based on file type
export const uploadMultipleImages = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.array("media", 10)(req, res, (err) => {
    if (err) {
      return next(err);
    }

    // Check file size limits based on file type
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const maxSize = getFileSizeLimit(file);
        if (file.size > maxSize) {
          const fileType = file.mimetype.startsWith("image/")
            ? "Image"
            : "Video";
          const maxSizeMB = maxSize / (1024 * 1024);
          return next(
            new Error(
              MESSAGES.FILE_TOO_LARGE.replace("{fileType}", fileType).replace(
                "{maxSizeMB}",
                maxSizeMB.toString()
              )
            )
          );
        }
      }
    }

    next();
  });
};

// Middleware for single image upload
export const uploadSingleImage = upload.single("image");
