import { NextFunction, Request, Response } from "express";

export const adminOnly = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "User not authenticated",
            })
            return;
        }
        if (req.user.role !== "Admin") {
            res.status(403).json({
                success: false,
                message: "Admin access only",
            });
            return;
        }

        next()
    } catch (error) {
         res.status(500).json({
      success: false,
      message: "Authorization error",
    });
    }
}