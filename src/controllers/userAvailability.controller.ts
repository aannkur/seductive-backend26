import { Response } from "express";
import {
  createUserAvailabilityService,
  getUserAvailabilityService,
  getUserAvailabilityByIdService,
  updateUserAvailabilityService,
  deleteUserAvailabilityService,
} from "../services/userAvailability.service";
import { AuthenticatedRequest } from "../types/common.type";
import { ApiResponse } from "../types/common.type";
import { MESSAGES } from "../constants/messages";

/**
 * Create User Availability controller
 */
export const createUserAvailabilityController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.USER_AVAILABILITY_CREATE_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const result = await createUserAvailabilityService({
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
      message: error.message || MESSAGES.USER_AVAILABILITY_CREATE_FAILED,
      error: error.message || MESSAGES.USER_AVAILABILITY_CREATE_ERROR,
    };

    const statusCode =
      error.message?.includes("not found") || error.message?.includes("Invalid")
        ? 400
        : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Get User Availability controller - Get all availability for authenticated user
 */
export const getUserAvailabilityController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.USER_AVAILABILITY_FETCH_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const result = await getUserAvailabilityService(userId);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.USER_AVAILABILITY_FETCH_FAILED,
      error: error.message || MESSAGES.USER_AVAILABILITY_FETCH_ERROR,
    };

    const statusCode = error.message?.includes("not found") ? 404 : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Get User Availability by ID controller
 */
export const getUserAvailabilityByIdController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.USER_AVAILABILITY_FETCH_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const { id } = req.params;
    const availabilityId = parseInt(id, 10);

    if (isNaN(availabilityId)) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.INVALID_AVAILABILITY_ID,
        error: "Invalid availability ID",
      };
      return res.status(400).json(response);
    }

    const result = await getUserAvailabilityByIdService(availabilityId, userId);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.USER_AVAILABILITY_FETCH_FAILED,
      error: error.message || MESSAGES.USER_AVAILABILITY_FETCH_ERROR,
    };

    const statusCode = error.message?.includes("not found") ? 404 : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Update User Availability controller
 */
export const updateUserAvailabilityController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.USER_AVAILABILITY_UPDATE_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const { id } = req.params;
    const availabilityId = parseInt(id, 10);

    if (isNaN(availabilityId)) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.INVALID_AVAILABILITY_ID,
        error: "Invalid availability ID",
      };
      return res.status(400).json(response);
    }

    const result = await updateUserAvailabilityService({
      availability_id: availabilityId,
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
      message: error.message || MESSAGES.USER_AVAILABILITY_UPDATE_FAILED,
      error: error.message || MESSAGES.USER_AVAILABILITY_UPDATE_ERROR,
    };

    const statusCode =
      error.message?.includes("not found") || error.message?.includes("Invalid")
        ? 400
        : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Delete User Availability controller
 */
export const deleteUserAvailabilityController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.USER_AVAILABILITY_DELETE_FAILED,
        error: "User ID not found in token",
      };
      return res.status(401).json(response);
    }

    const { id } = req.params;
    const availabilityId = parseInt(id, 10);

    if (isNaN(availabilityId)) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.INVALID_AVAILABILITY_ID,
        error: "Invalid availability ID",
      };
      return res.status(400).json(response);
    }

    const result = await deleteUserAvailabilityService(availabilityId, userId);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.USER_AVAILABILITY_DELETE_FAILED,
      error: error.message || MESSAGES.USER_AVAILABILITY_DELETE_ERROR,
    };

    const statusCode = error.message?.includes("not found") ? 404 : 400;

    return res.status(statusCode).json(response);
  }
};
