import { Response } from "express";
import {
  addUserTagService,
  removeUserTagService,
  getUserTagsService,
} from "../services/userTags.service";
import { AuthenticatedRequest } from "../types/common.type";
import { ApiResponse } from "../types/common.type";
import { MESSAGES } from "../constants/messages";

/**
 * Add Tag to User Profile controller
 */
export const addUserTagController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.USER_TAG_ADD_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const result = await addUserTagService({
      user_id: userId,
      ...req.body,
    });

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.USER_TAG_ADD_FAILED,
      error: error.message || MESSAGES.USER_TAG_ADD_ERROR,
    };

    const statusCode =
      error.message?.includes("not found") ||
      error.message?.includes("already exists")
        ? 400
        : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Remove Tag from User Profile controller
 */
export const removeUserTagController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.USER_TAG_REMOVE_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const { tag_id } = req.params;
    const tagId = parseInt(tag_id, 10);

    if (isNaN(tagId)) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.INVALID_TAG_ID,
        error: "Invalid tag ID",
      };
      return res.status(400).json(response);
    }

    const result = await removeUserTagService({
      user_id: userId,
      tag_id: tagId,
    });

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.USER_TAG_REMOVE_FAILED,
      error: error.message || MESSAGES.USER_TAG_REMOVE_ERROR,
    };

    const statusCode = error.message?.includes("not found") ? 404 : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Get User Tags controller - Get all tags for authenticated user
 */
export const getUserTagsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.USER_TAGS_FETCH_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const result = await getUserTagsService(userId);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.USER_TAGS_FETCH_FAILED,
      error: error.message || MESSAGES.USER_TAGS_FETCH_ERROR,
    };

    const statusCode = error.message?.includes("not found") ? 404 : 400;

    return res.status(statusCode).json(response);
  }
};
