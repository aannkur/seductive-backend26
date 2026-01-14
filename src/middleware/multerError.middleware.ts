import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { ApiResponse } from "../types/common.type";
import { MESSAGES } from "../constants/messages";

/**
 * Multer Error Handler Middleware
 * Catches Multer errors and converts them to proper JSON responses
 */
export const multerErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    let message = MESSAGES.GALLERY_IMAGES_UPLOAD_ERROR;
    let statusCode = 400;

    switch (error.code) {
      case "LIMIT_FILE_COUNT":
        message = MESSAGES.TOO_MANY_IMAGES;
        statusCode = 400;
        break;
      case "LIMIT_FILE_SIZE":
        message = MESSAGES.MEDIA_FILE_TOO_LARGE;
        statusCode = 400;
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field. Use 'media' field for file uploads.";
        statusCode = 400;
        break;
      default:
        message = error.message || MESSAGES.GALLERY_IMAGES_UPLOAD_ERROR;
        statusCode = 400;
    }

    const response: ApiResponse<null> = {
      success: false,
      message: message,
      error: message,
    };

    res.status(statusCode).json(response);
    return;
  }

  // If it's a regular error from fileFilter
  if (
    error.message &&
    (error.message.includes("Only image files") ||
      error.message.includes("Only image and video files"))
  ) {
    const response: ApiResponse<null> = {
      success: false,
      message: MESSAGES.INVALID_MEDIA_FILE,
      error: MESSAGES.INVALID_MEDIA_FILE,
    };

    res.status(400).json(response);
    return;
  }

  // Handle file size errors
  if (error.message && error.message.includes("too large")) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message,
      error: error.message,
    };

    res.status(400).json(response);
    return;
  }

  // Pass other errors to next error handler
  next(error);
};
