import { Response } from "express";
import { Request } from "express";
import {
  getAllCountriesService,
  getCountryByIdService,
} from "../services/country.service";
import { ApiResponse } from "../types/common.type";
import { MESSAGES } from "../constants/messages";

/**
 * Get all countries controller
 */
export const getAllCountriesController = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await getAllCountriesService();

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : MESSAGES.COUNTRIES_FETCH_ERROR;
    const response: ApiResponse<null> = {
      success: false,
      message: errorMessage || MESSAGES.COUNTRIES_FETCH_FAILED,
      error: errorMessage || MESSAGES.COUNTRIES_FETCH_ERROR,
    };

    return res.status(400).json(response);
  }
};

/**
 * Get country by ID controller
 */
export const getCountryByIdController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const countryId = parseInt(id, 10);

    if (isNaN(countryId)) {
      const response: ApiResponse<null> = {
        success: false,
        message: MESSAGES.INVALID_COUNTRY_ID,
        error: "Invalid country ID",
      };
      return res.status(400).json(response);
    }

    const result = await getCountryByIdService(countryId);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : MESSAGES.COUNTRY_FETCH_ERROR;
    const response: ApiResponse<null> = {
      success: false,
      message: errorMessage || MESSAGES.COUNTRY_FETCH_FAILED,
      error: errorMessage || MESSAGES.COUNTRY_FETCH_ERROR,
    };

    const statusCode =
      error instanceof Error && error.message?.includes("not found")
        ? 404
        : 400;

    return res.status(statusCode).json(response);
  }
};
