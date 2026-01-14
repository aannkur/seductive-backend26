import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/common.type";

// check user is authorized or not via verifying with token jwt...
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token =
    req.cookies?.session || req.header("Authorization")?.replace("Bearer ", "");
  // First try to get token from cookie, then fallback to header for backward compatibility
  // const token =
  //   req.cookies?.auth_token ||
  //   req.header("Authorization")?.replace("Bearer ", "");

  if (!token)
    return res
      .status(401)
      .json({ error: "Unauthorized: No token provided", UA: false });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(
      "xxxxxxxxxxxxxxx Authentication error: xxxxxxxxxxxxxxx",
      error
    );
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid token", UA: true });
  }
};
