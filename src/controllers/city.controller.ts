import { Response } from "express";
import { PaginatedRequest } from "../types/common.type";
import {
  getAllCitiesService,
  getCityByIdService,
  getCitiesByCountryIdService,
  getCitiesByCountryShortcodeService,
} from "../services/city.service";
import { ApiResponse } from "../types/common.type";
import { MESSAGES } from "../constants/messages";

/**
 * Get all cities controller (with pagination)
 */
export const getAllCitiesController = async (
  req: PaginatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // If search parameter is present, use service directly with pagination (pagination middleware doesn't handle Op.or)
    if (req.query.search) {
      const filters: {
        country_id?: number;
        country_shortcode?: string;
        search?: string;
      } = {};

      if (req.query.country_id) {
        filters.country_id = parseInt(req.query.country_id as string, 10);
      }
      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const result = await getAllCitiesService(filters);

      // Handle pagination for search results
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "10", 10);
      const totalResults = result.total || 0;
      const totalPages = Math.ceil(totalResults / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCities = result.cities.slice(startIndex, endIndex);

      const response: ApiResponse<unknown> = {
        success: true,
        message: result.message,
        data: paginatedCities,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults,
          hasNext: page * limit < totalResults,
          hasPrev: page > 1,
        },
      };

      return res.status(200).json(response);
    }

    // If pagination middleware has already set paginatedData, use it
    if (req.paginatedData) {
      const response: ApiResponse<unknown> = {
        success: true,
        message: MESSAGES.CITIES_FETCHED,
        data: req.paginatedData.data,
        pagination: {
          currentPage: req.paginatedData.pagination.currentPage,
          totalPages: req.paginatedData.pagination.totalPages,
          totalResults: req.paginatedData.pagination.totalResults,
          hasNext: req.paginatedData.pagination.hasNextPage,
          hasPrev: req.paginatedData.pagination.hasPrevPage,
        },
      };

      return res.status(200).json(response);
    }

    // Fallback: if pagination middleware didn't run, use service directly
    const filters: {
      country_id?: number;
      country_shortcode?: string;
      search?: string;
    } = {};
    if (req.query.country_id) {
      filters.country_id = parseInt(req.query.country_id as string, 10);
    }

    const result = await getAllCitiesService(filters);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : MESSAGES.CITIES_FETCH_ERROR;
    const response: ApiResponse<null> = {
      success: false,
      message: errorMessage || MESSAGES.CITIES_FETCH_FAILED,
      error: errorMessage || MESSAGES.CITIES_FETCH_ERROR,
    };

    return res.status(400).json(response);
  }
};

/**
 * Get city by ID controller
 */
export const getCityByIdController = async (
  req: PaginatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const cityId = parseInt(id, 10);

    if (isNaN(cityId)) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.INVALID_CITY_ID,
        error: "Invalid city ID",
      };
      return res.status(400).json(response);
    }

    const result = await getCityByIdService(cityId);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : MESSAGES.CITY_FETCH_ERROR;
    const response: ApiResponse<null> = {
      success: false,
      message: errorMessage || MESSAGES.CITY_FETCH_FAILED,
      error: errorMessage || MESSAGES.CITY_FETCH_ERROR,
    };

    const statusCode =
      error instanceof Error && error.message?.includes("not found")
        ? 404
        : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Get cities by country ID controller
 */
export const getCitiesByCountryIdController = async (
  req: PaginatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { countryId } = req.params;
    const id = parseInt(countryId, 10);

    if (isNaN(id)) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.INVALID_COUNTRY_ID,
        error: "Invalid country ID",
      };
      return res.status(400).json(response);
    }

    const result = await getCitiesByCountryIdService(id);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : MESSAGES.CITIES_FETCH_ERROR;
    const response: ApiResponse<null> = {
      success: false,
      message: errorMessage || MESSAGES.CITIES_FETCH_FAILED,
      error: errorMessage || MESSAGES.CITIES_FETCH_ERROR,
    };

    const statusCode =
      error instanceof Error && error.message?.includes("not found")
        ? 404
        : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Get cities by country shortcode controller
 */
export const getCitiesByCountryShortcodeController = async (
  req: PaginatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { shortcode } = req.params;

    if (!shortcode) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.INVALID_COUNTRY_SHORTCODE,
        error: "Country shortcode is required",
      };
      return res.status(400).json(response);
    }

    const result = await getCitiesByCountryShortcodeService(shortcode);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : MESSAGES.CITIES_FETCH_ERROR;
    const response: ApiResponse<null> = {
      success: false,
      message: errorMessage || MESSAGES.CITIES_FETCH_FAILED,
      error: errorMessage || MESSAGES.CITIES_FETCH_ERROR,
    };

    const statusCode =
      error instanceof Error && error.message?.includes("not found")
        ? 404
        : 400;

    return res.status(statusCode).json(response);
  }
};
