import jwt, { Secret } from "jsonwebtoken";
import { MESSAGES } from "../constants/messages";

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

/**
 * Generate JWT token for authenticated user
 * @param payload - User data to encode in token
 * @returns JWT token string
 */
export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error(MESSAGES.JWT_SECRET_NOT_DEFINED);
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d"; // Default 7 days

  return jwt.sign(payload, secret as Secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Verify and decode JWT token
 * @param token - JWT token string
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error(MESSAGES.JWT_SECRET_NOT_DEFINED);
  }

  return jwt.verify(token, secret) as TokenPayload;
};
