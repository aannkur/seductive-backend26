import { Request,Response } from "express";
import { Faq } from "../models";

export const getFaqController =  async (
    _req:Request,
    res:Response
):Promise<Response> => {
    try {
        const faqs = await Faq.findAll({
            attributes:["id","question", "answer", "createdAt"],
            order:[["createdAt", "DESC"]],
        })
        
        return res.status(200).json({
            success:true,
            data:faqs
        })
    } catch (error) {
         return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: error instanceof Error ? error.message : String(error),
    });
    }
}