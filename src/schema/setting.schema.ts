import {z} from "zod"

export const updateGeneralSettingsSchema  = z.object({
    body: z.object({
        name:z
        .string()
        .min(2,"full name must be atLeast 2 characters")
        .max(150)
        .optional(),

        role:z
        .enum([ "Admin" , "Creator" , "Client" , "Escort"])
        .optional(),
        
        phone:z
        .string()
        .min(7)
        .max(20)
        .optional(),

        show_phone:z.boolean().optional(),

        profile_bio:z
        .string()
        .max(2000, "Bio cannot exceed 2000 characters")
        .optional()
    })
})

export type updateGeneralSettingInput = z.infer<
typeof updateGeneralSettingsSchema
>
["body"];