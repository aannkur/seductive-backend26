import { Request,Response } from "express"
import Newsletter from "../models/newsLetter.model";

export const NewsLetterController = async(
    req:Request,
    res:Response
):Promise<Response> => {
    try {
        const {email} = req.body;
        
        // basic safety check
        if(!email){
            return res.status(400).json({
                success:false,
                message:"Email is Required"
            })
        }

        const newsLetter = await Newsletter.create(req.body)

        return res.status(201).json({
            success:true,
            message:"Newsletter subscribed successfully",
            data:newsLetter,
        });
    } catch (error) {
        const errorMessage =  error instanceof Error ? error.message : "Something went wrong";

        return res.status(400).json({
            success:false,
            message:errorMessage
        })
    }
}