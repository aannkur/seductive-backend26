import { z } from "zod";

export const adSchema = z.object({
  adTitle: z
    .string()
    .min(3, "Ad title is required"),

  adDescription: z
    .string()
    .min(5, "Ad description is required"),

  adType: z.enum(["vip", "featured", "standard"]),

  adPlacement: z.enum(["home", "searchresult", "profilehighlight"]),

  adDuration: z.coerce
    .number()
    .int()
    .min(1)
    .max(365),
});

export type AdInput = z.infer<typeof adSchema>;
