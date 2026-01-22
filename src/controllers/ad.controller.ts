import { Request, Response } from "express";
import { Ad } from "../models";
import { uploadBufferToS3 } from "../utils/s3.utils";


export const CreateAdController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {

        const { adTitle, adDescription, adType, adPlacement, adDuration } = req.body;

        // upload files
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one media file"
            });
        }

        // upload all file to s3
        const uploadedFiles = await Promise.all(
            files.map((file) => uploadBufferToS3(file.buffer, file.originalname, file.mimetype))
        );

        const mediaUrls = uploadedFiles.map((f) => f.Location);
        const imageFiles = files
            .map((file, index) => ({ mimetype: file.mimetype, location: uploadedFiles[index].Location }))
            .filter(f => f.mimetype.startsWith("image/"))
            .map(f => f.location);
        const mainProfile = imageFiles.length > 0
            ? imageFiles[0]
            : mediaUrls[0];

        const ad = await Ad.create({
            adTitle,
            adDescription,
            adType,
            adPlacement,
            adDuration,
            mediaUrls,
            mainProfile
        });

        return res.status(201).json({
            success: true,
            message: "Ad created successfully",
            data: ad,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message :"Unknown error ",
        });
    }
}

export const GetVipAds = async (
    req:Request,
    res:Response
):Promise<Response> =>{
    try {
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message :"Unknown error ",
        });
    }
}