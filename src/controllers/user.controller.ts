import { Response } from "express";
import { AuthenticatedRequest } from "../types/common.type";
import { ApiResponse } from "../types/common.type";
import {
  updateUserProfileService,
  getUserProfileService,
} from "../services/profile.service";
import { saveClientPreferencesService } from "../services/clientPreferences.service";
import User from "../models/user.model";
import { MESSAGES } from "../constants/messages";

/**
 * Update User Profile Controller
 * Supports partial updates for user, availability, tags, and gallery
 */
export const updateUserProfileController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.PROFILE_UPDATE_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    // Check if client_preferences is in the payload and user is a Client
    const { client_preferences, ...restBody } = req.body;
    if (client_preferences) {
      // Fetch user to check role
      const user = await User.findByPk(userId);
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          message: MESSAGES.USER_NOT_FOUND,
          error: "User not found",
        };
        return res.status(404).json(response);
      }

      // // Only Clients can set client preferences do not send the client_preferencee in the body only client can send this
      // User is a Client, save/update client preferences
      await saveClientPreferencesService({
        user_id: userId,
        ...client_preferences,
      });
    }

    // Update user profile (excluding client_preferences from the body)
    const result = await updateUserProfileService({
      user_id: userId,
      ...restBody,
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
      message: error.message || MESSAGES.PROFILE_UPDATE_FAILED,
      error: error.message || MESSAGES.PROFILE_UPDATE_ERROR,
    };

    const statusCode =
      error.message?.includes("not found") ||
      error.message?.includes("Invalid") ||
      error.message?.includes("required")
        ? 400
        : 500;

    return res.status(statusCode).json(response);
  }
};

/**
 * Get User Profile Controller
 */
export const getUserProfileController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.PROFILE_FETCH_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const result = await getUserProfileService(userId);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.PROFILE_FETCH_FAILED,
      error: error.message || MESSAGES.PROFILE_FETCH_ERROR,
    };

    const statusCode = error.message?.includes("not found") ? 404 : 500;

    return res.status(statusCode).json(response);
  }
};
