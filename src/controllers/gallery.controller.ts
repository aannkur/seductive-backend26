import { Response } from "express";
import { AuthenticatedRequest } from "../types/common.type";
import { ApiResponse } from "../types/common.type";
import { uploadGalleryImagesService } from "../services/gallery.service";
import { MESSAGES } from "../constants/messages";

/**
 * Upload Gallery Images Controller
 */
export const uploadGalleryImagesController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.GALLERY_IMAGES_UPLOAD_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const files = req.files as Express.Multer.File[];
    const access_type =
      (req.body.access_type as "public" | "private") || "public";
    const type = (req.body.type as "gallery" | "profile") || "gallery";

    if (!files || files.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.NO_IMAGES_PROVIDED,
        error: MESSAGES.NO_IMAGES_PROVIDED,
      };
      return res.status(400).json(response);
    }

    const result = await uploadGalleryImagesService({
      user_id: userId,
      files,
      access_type,
      type,
    });

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : MESSAGES.GALLERY_IMAGES_UPLOAD_ERROR;
    const response: ApiResponse<null> = {
      success: false,
      message: errorMessage || MESSAGES.GALLERY_IMAGES_UPLOAD_FAILED,
      error: errorMessage || MESSAGES.GALLERY_IMAGES_UPLOAD_ERROR,
    };

    const statusCode =
      errorMessage.includes("Invalid") ||
      errorMessage.includes("Too many") ||
      errorMessage.includes("No images")
        ? 400
        : 500;

    return res.status(statusCode).json(response);
  }
};
