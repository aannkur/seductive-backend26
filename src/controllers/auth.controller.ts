import { Request, Response } from "express";
import {
  signupService,
  verifyOtpService,
  resendOtpService,
  forgotPasswordService,
  resetPasswordService,
  loginService,
  verifyLoginOtpService,
  resendLoginOtpService,
  logoutService,
} from "../services/auth.service";
import { AuthenticatedRequest } from "../types/common.type";
import { ApiResponse } from "../types/common.type";
import { MESSAGES } from "../constants/messages";

/**
 * Login controller - Authenticate user and send OTP
 */
export const loginController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await loginService(req.body);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.LOGIN_FAILED,
      error: error.message || MESSAGES.LOGIN_ERROR,
    };

    const statusCode =
      error.message?.includes("Invalid") ||
      error.message?.includes("not verified") ||
      error.message?.includes("blocked") ||
      error.message?.includes("suspended") ||
      error.message?.includes("inactive") ||
      error.message?.includes("cooldown")
        ? 401
        : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Verify Login OTP controller - Verify OTP and return token
 */
export const verifyLoginOtpController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await verifyLoginOtpService(req.body);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    // Set token in cookie
    res.cookie("session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.OTP_VERIFICATION_FAILED,
      error: error.message || MESSAGES.OTP_VERIFICATION_ERROR,
    };

    const statusCode =
      error.message?.includes("Invalid") ||
      error.message?.includes("expired") ||
      error.message?.includes("not found")
        ? 400
        : error.message?.includes("max attempts")
          ? 429
          : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Signup controller - Create temp user and send OTP
 */
export const signupController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await signupService(req.body);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.SIGNUP_FAILED,
      error: error.message || MESSAGES.SIGNUP_ERROR,
    };

    const statusCode = error.message?.includes("already") ? 409 : 400;
    return res.status(statusCode).json(response);
  }
};

/**
 * Verify OTP controller - Verify OTP and create user account
 */
export const verifyOtpController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await verifyOtpService(req.body);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    // Set token in cookie
    res.cookie("session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.OTP_VERIFICATION_FAILED,
      error: error.message || MESSAGES.OTP_VERIFICATION_ERROR,
    };

    const statusCode =
      error.message?.includes("Invalid") || error.message?.includes("expired")
        ? 400
        : error.message?.includes("already")
          ? 409
          : 500;

    return res.status(statusCode).json(response);
  }
};

/**
 * Resend OTP controller - Resend OTP to temp user
 */
export const resendOtpController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await resendOtpService(req.body);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.RESEND_OTP_FAILED,
      error: error.message || MESSAGES.RESEND_OTP_ERROR,
    };

    const statusCode =
      error.message?.includes("already") || error.message?.includes("verified")
        ? 409
        : error.message?.includes("No signup found")
          ? 404
          : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Forgot Password controller - Send password reset OTP
 */
export const forgotPasswordController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await forgotPasswordService(req.body);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.FORGOT_PASSWORD_FAILED,
      error: error.message || MESSAGES.FORGOT_PASSWORD_ERROR,
    };

    const statusCode = error.message?.includes("not found")
      ? 404
      : error.message?.includes("already")
        ? 409
        : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Reset Password controller - Reset password with OTP verification
 */
export const resetPasswordController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await resetPasswordService(req.body);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.PASSWORD_RESET_FAILED,
      error: error.message || MESSAGES.PASSWORD_RESET_ERROR,
    };

    const statusCode =
      error.message?.includes("Invalid") ||
      error.message?.includes("expired") ||
      error.message?.includes("cannot be the same")
        ? 400
        : error.message?.includes("not found")
          ? 404
          : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Resend Login OTP controller - Resend login OTP to user's email
 */
export const resendLoginOtpController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await resendLoginOtpService(req.body);

    const response: ApiResponse<typeof result> = {
      success: true,
      message: result.message,
      data: result,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message || MESSAGES.RESEND_OTP_FAILED,
      error: error.message || MESSAGES.RESEND_OTP_ERROR,
    };

    const statusCode =
      error.message?.includes("not found") ||
      error.message?.includes("not verified")
        ? 404
        : error.message?.includes("blocked") ||
            error.message?.includes("suspended") ||
            error.message?.includes("inactive") ||
            error.message?.includes("cooldown") ||
            error.message?.includes("max attempts")
          ? 400
          : 400;

    return res.status(statusCode).json(response);
  }
};

/**
 * Logout controller - Clear session cookie
 */
export const logoutController = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const result = await logoutService();

    // Clear the session cookie
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // sameSite: "strict", change in some time 
      sameSite: "lax",
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
      message: error.message || MESSAGES.LOGOUT_FAILED,
      error: error.message || MESSAGES.LOGOUT_ERROR,
    };

    return res.status(400).json(response);
  }
};
