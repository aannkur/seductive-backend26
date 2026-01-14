import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";
import { MESSAGES } from "../constants/messages";

// Validate AWS configuration
const validateAwsConfig = () => {
  const requiredEnvVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY",
    "AWS_SECRET_KEY",
    "AWS_BUCKET_NAME",
    "AWS_SECRET_FOLDER",
  ];
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      MESSAGES.AWS_ENV_VARS_MISSING.replace("{missing}", missing.join(", "))
    );
  }
};

// Initialize AWS config validation
try {
  validateAwsConfig();
} catch (error: any) {
  console.error("❌ S3 Configuration Error:", error.message);
  throw error;
}

// Extract and type AWS configuration values (guaranteed to exist after validation)
const AWS_REGION = process.env.AWS_REGION as string;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY as string;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY as string;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME as string;
const AWS_SECRET_FOLDER = process.env.AWS_SECRET_FOLDER as string;

// CONF
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

// Upload buffer to S3
const uploadBufferToS3 = async (
  buffer: Buffer,
  key: string,
  contentType = "application/octet-stream",
  _folder = "testing"
) => {
  try {
    // Input validation
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error(MESSAGES.INVALID_BUFFER_REQUIRED);
    }

    if (!key || typeof key !== "string" || key.trim().length === 0) {
      throw new Error(MESSAGES.INVALID_S3_KEY);
    }

    if (buffer.length === 0) {
      throw new Error(MESSAGES.INVALID_BUFFER_EMPTY);
    }

    // Validate AWS config
    validateAwsConfig();

    const s3Key = `${AWS_SECRET_FOLDER}/${key}`;
    const uploadParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    return {
      key: s3Key,
      Location: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`,
    };
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error occurred";
    const errorName = error.name || "S3UploadError";

    // Log detailed error information
    console.error("uploadBufferToS3: Failed to upload to S3", {
      error: errorMessage,
      errorName,
      key: key || "N/A",
      contentType,
      bufferSize: buffer?.length || 0,
      stack: error.stack,
    });

    // Re-throw with more context
    throw new Error(
      MESSAGES.S3_UPLOAD_FAILED.replace("{errorMessage}", errorMessage).replace(
        "{key}",
        key || "N/A"
      )
    );
  }
};

// Delete file from S3 (by key or full URL)
const deleteFileFromS3 = async (input: string) => {
  try {
    // Input validation
    if (!input || typeof input !== "string" || input.trim().length === 0) {
      throw new Error(MESSAGES.INVALID_S3_INPUT);
    }

    // Validate AWS config
    validateAwsConfig();

    let key = input.trim();

    // If full URL is provided, extract the key
    if (/^https?:\/\//.test(key)) {
      const splitUrl = key.split(".amazonaws.com/");
      if (splitUrl.length < 2 || !splitUrl[1]) {
        throw new Error(MESSAGES.INVALID_S3_URL_FORMAT.replace("{url}", key));
      }
      key = splitUrl[1];
    }

    const deleteParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
    console.log("✅ deleteFileFromS3: Deleted S3 object:", key);

    return { success: true, key };
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error occurred";
    const errorName = error.name || "S3DeleteError";

    // Log detailed error information
    console.error("deleteFileFromS3: Failed to delete file from S3", {
      error: errorMessage,
      errorName,
      input: input || "N/A",
      stack: error.stack,
    });

    // Re-throw with more context
    throw new Error(
      MESSAGES.S3_DELETE_FAILED.replace("{errorMessage}", errorMessage).replace(
        "{input}",
        input || "N/A"
      )
    );
  }
};

// Generate signed URL from full DB URL
const generateSignedUrlFromDbUrl = async (fullUrl: string, expiresIn = 10) => {
  try {
    // Input validation
    if (
      !fullUrl ||
      typeof fullUrl !== "string" ||
      fullUrl.trim().length === 0
    ) {
      throw new Error(MESSAGES.INVALID_S3_URL_EMPTY);
    }

    if (typeof expiresIn !== "number" || expiresIn <= 0 || expiresIn > 604800) {
      throw new Error(MESSAGES.INVALID_EXPIRES_IN);
    }

    // Validate AWS config
    validateAwsConfig();

    const baseUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/`;

    if (!fullUrl.startsWith(baseUrl)) {
      throw new Error(
        MESSAGES.INVALID_S3_URL_BASE.replace("{fullUrl}", fullUrl).replace(
          "{baseUrl}",
          baseUrl
        )
      );
    }

    const key = fullUrl.replace(baseUrl, "");

    if (!key || key.length === 0) {
      throw new Error(
        MESSAGES.INVALID_S3_URL_KEY_EXTRACTION.replace("{fullUrl}", fullUrl)
      );
    }

    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn });
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error occurred";
    const errorName = error.name || "S3SignedUrlError";

    // Log detailed error information
    console.error("generateSignedUrlFromDbUrl: Failed to sign URL", {
      error: errorMessage,
      errorName,
      fullUrl: fullUrl || "N/A",
      expiresIn,
      stack: error.stack,
    });

    // Re-throw with more context instead of silently falling back
    throw new Error(
      MESSAGES.S3_SIGNED_URL_GENERATION_FAILED.replace(
        "{errorMessage}",
        errorMessage
      ).replace("{url}", fullUrl || "N/A")
    );
  }
};

export { uploadBufferToS3, deleteFileFromS3, generateSignedUrlFromDbUrl };
