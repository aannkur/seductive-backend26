import { z } from "zod"

export const faqSchema = z.object({
    body: z.object({
        question: z.string()
            .min(5, "Question must be at least 5 characters")
            .trim(),
        answer: z
            .string()
            .min(5, "Answer must be at least 5 characters")
            .trim(),
    })
})


export type faqSchemaInput = z.infer<
    typeof faqSchema>["body"]