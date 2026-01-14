import { Response } from "express";
import {
  saveClientPreferencesService,
  updateClientPreferencesService,
  getClientPreferencesService,
  deleteClientPreferencesService,
} from "../services/clientPreferences.service";
import { AuthenticatedRequest } from "../types/common.type";
import { ApiResponse } from "../types/common.type";
import { MESSAGES } from "../constants/messages";

/**
 * Save Client Preferences controller - Create or update preferences
 */
export const saveClientPreferencesController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.CLIENT_PREFERENCES_SAVE_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const result = await saveClientPreferencesService({
      user_id: userId,
      ...req.body,
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
      message: error.message || MESSAGES.CLIENT_PREFERENCES_SAVE_FAILED,
      error: error.message || MESSAGES.CLIENT_PREFERENCES_SAVE_ERROR,
    };

    const statusCode =
      error.message?.includes("not found") ||
      error.message?.includes("Only clients")
        ? 404
        : error.message?.includes("required") ||
            error.message?.includes("must be")
          ? 400
          : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Update Client Preferences controller - Update existing preferences
 */
export const updateClientPreferencesController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.CLIENT_PREFERENCES_UPDATE_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const result = await updateClientPreferencesService({
      user_id: userId,
      ...req.body,
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
      message: error.message || MESSAGES.CLIENT_PREFERENCES_UPDATE_FAILED,
      error: error.message || MESSAGES.CLIENT_PREFERENCES_UPDATE_ERROR,
    };

    const statusCode =
      error.message?.includes("not found") ||
      error.message?.includes("Only clients")
        ? 404
        : error.message?.includes("required") ||
            error.message?.includes("must be")
          ? 400
          : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Get Client Preferences controller - Fetch user's preferences
 */
export const getClientPreferencesController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.CLIENT_PREFERENCES_FETCH_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const result = await getClientPreferencesService(userId);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.CLIENT_PREFERENCES_FETCH_FAILED,
      error: error.message || MESSAGES.CLIENT_PREFERENCES_FETCH_ERROR,
    };

    const statusCode = error.message?.includes("not found") ? 404 : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Delete Client Preferences controller - Delete user's preferences
 */
export const deleteClientPreferencesController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.CLIENT_PREFERENCES_DELETE_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const result = await deleteClientPreferencesService(userId);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.CLIENT_PREFERENCES_DELETE_FAILED,
      error: error.message || MESSAGES.CLIENT_PREFERENCES_DELETE_ERROR,
    };

    const statusCode = error.message?.includes("not found") ? 404 : 400;

    return res.status(statusCode).json(response);
  }
};
