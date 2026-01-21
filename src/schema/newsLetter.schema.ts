import {z} from "zod"

export const NewsLetterschema = z.object({
    body:z.object({
        email:z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    })
})

export type NewsletterInput = z.infer<typeof NewsLetterschema>["body"];