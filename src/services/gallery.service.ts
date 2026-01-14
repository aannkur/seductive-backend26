import { uploadBufferToS3 } from "../utils/s3.utils";
import { MESSAGES } from "../constants/messages";
import crypto from "crypto";

/**
 * Upload Gallery Media Service
 * Uploads images and videos to S3 immediately and returns URLs
 */
export const uploadGalleryImagesService = async (data: {
  user_id: number;
  files: Express.Multer.File[];
  access_type?: "public" | "private";
  type?: "gallery" | "profile";
}) => {
  const { user_id, files, access_type = "public", type = "gallery" } = data;

  // Validate files
  if (!files || files.length === 0) {
    throw new Error(MESSAGES.NO_IMAGES_PROVIDED);
  }

  if (files.length > 10) {
    throw new Error(MESSAGES.TOO_MANY_IMAGES);
  }

  // Validate each file (type and size already checked in middleware, but double-check here)
  for (const file of files) {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (!isImage && !isVideo) {
      throw new Error(MESSAGES.INVALID_MEDIA_FILE);
    }

    // Size limits (already checked in middleware, but validate again)
    if (isImage && file.size > 10 * 1024 * 1024) {
      throw new Error(MESSAGES.IMAGE_FILE_TOO_LARGE);
    }
    if (isVideo && file.size > 100 * 1024 * 1024) {
      throw new Error(MESSAGES.VIDEO_FILE_TOO_LARGE);
    }
  }

  // Upload all media files (images and videos) to S3 in parallel
  const uploadPromises = files.map(async (file, index) => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString("hex");
      const fileExtension = file.originalname.split(".").pop() || "jpg";
      const fileName = `${user_id}-${timestamp}-${randomString}-${index}.${fileExtension}`;

      // Determine folder based on type and access type
      let folder: string;
      if (type === "profile") {
        folder = "profile";
      } else {
        // type === "gallery"
        folder =
          access_type === "public" ? "gallery/public" : "gallery/private";
      }
      const s3Key = `${folder}/${fileName}`;

      // Upload to S3
      const result = await uploadBufferToS3(file.buffer, s3Key, file.mimetype);

      return {
        index,
        url: result.Location,
        s3_key: result.key,
        originalName: file.originalname,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to upload ${file.originalname}: ${errorMessage}`);
    }
  });

  // Wait for all uploads to complete
  const uploadResults = await Promise.all(uploadPromises);

  // Sort by index to maintain order
  uploadResults.sort((a, b) => a.index - b.index);

  // Extract URLs in order
  const mediaUrls = uploadResults.map((result) => result.url);

  return {
    message: MESSAGES.GALLERY_IMAGES_UPLOADED,
    media: mediaUrls, // New key for clarity
    uploadDetails: uploadResults.map((result) => ({
      url: result.url,
      s3_key: result.s3_key,
      originalName: result.originalName,
    })),
  };
};
