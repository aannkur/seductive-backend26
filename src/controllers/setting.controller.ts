import { Request, Response } from "express";
import { User } from "../models";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const genralController = async (
    req: Request,
    res: Response,
): Promise<Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        const userId = req.user.id;
        const allowedFields = ["name", "profile_bio", "role"];
        const updateData = Object.fromEntries(
            Object.entries(req.body).filter(([key]) =>
                allowedFields.includes(key)
            )
        );


        const user = await User.findByPk(userId)

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        // updating new data with optional
        await user.update(updateData)

        // reaload user to get updated data
        await user.reload();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error instanceof Error ? error.message : String(error)
        });
    }
}