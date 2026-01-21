import { Request, Response } from "express";
import { Faq } from "../../models";
import { faqSchemaInput } from "../../schema/faq.schema";

export const createFaqController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { question, answer } = req.body as faqSchemaInput
        const { id } = req.params;
        
        // if having id in params update existing faq
        if (id) {
            const faq = await Faq.findByPk(id);

            if (!faq) {
                return res.status(404).json({
                    success: false,
                    message: "FAQ not found",
                });
            }
            await faq.update({ question, answer });

            return res.status(200).json({
                success: true,
                message: "FAQ updated successfully",
                data: faq,
            });
        }

        // if not having id then create a new faq
        const faq = await Faq.create({
            question,
            answer,
        })
        return res.status(201).json({
            success: true,
            message: "FAQ created successfully",
            data: faq,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create FAQ",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const deleteFaqController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        // extract id in params
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "FAQ id is required",
            });
        }
        // Get FAQ  from db
        const faq = await Faq.findByPk(id);

        if (!faq) {
            return res.status(400).json({
                success: false,
                message: "FAQ not found"
            })
        }
        // faq soft delete 
        await faq.destroy();

        return res.status(200).json({
            success: true,
            message: "FAQ deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete FAQ",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}