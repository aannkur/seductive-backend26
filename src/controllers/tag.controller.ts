import { Request, Response } from "express";
import { getAllTagsService } from "../services/tag.service";
import { ApiResponse } from "../types/common.type";
import { MESSAGES } from "../constants/messages";

/**
 * Get all tags controller with optional search query parameter
 */
export const getAllTagsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const search = req.query.search as string | undefined;
    const tag_type = req.query.tag_type as "profile" | "content" | undefined;
    const result = await getAllTagsService(search, tag_type);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : MESSAGES.TAGS_FETCH_ERROR;
    const response: ApiResponse<null> = {
      success: false,
      message: errorMessage || MESSAGES.TAGS_FETCH_FAILED,
      error: errorMessage || MESSAGES.TAGS_FETCH_ERROR,
    };

    return res.status(400).json(response);
  }
};
