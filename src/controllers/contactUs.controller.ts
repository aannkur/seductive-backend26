import { Request, Response } from "express";
import { ApiResponse } from "../types/common.type";
import { MESSAGES } from "../constants/messages";
import { createContactUsService } from "../services/ContactUs.service";

/**
 * Create Contact Us request
 */
export const createContactUsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { full_name, email, help_topic, message } = req.body;

    const contact = await createContactUsService({
      full_name,
      email,
      help_topic,
      message,
    })

    const response: ApiResponse<typeof contact> = {
      success: true,
      message: MESSAGES.CONTACT_US_CREATED || "Message sent successfully",
      data: contact,
    };

    return res.status(201).json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit contact form";

    const response: ApiResponse<null> = {
      success: false,
      message: errorMessage,
      error: errorMessage,
    };

    return res.status(400).json(response);
  }
};

