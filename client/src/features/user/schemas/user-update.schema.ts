import { z } from "zod";

export const UserUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "نام الزامی است" })
    .max(100, { message: "نام حداکثر ۱۰۰ کاراکتر می‌باشد" })
    .optional(),

  lastName: z
    .string()
    .min(1, { message: "نام خانوادگی الزامی است" })
    .max(100, { message: "نام خانوادگی حداکثر ۱۰۰ کاراکتر می‌باشد" })
    .optional(),

  mobile: z
    .string()
    .length(11, { message: "شماره موبایل باید دقیقاً ۱۱ کاراکتر باشد" })
    .regex(/^[0-9+\-\s()]{10,}$/, "Invalid mobile number format")
    .optional(),

  isActive: z.boolean().optional(),
});

export type UserUpdateDto = z.infer<typeof UserUpdateSchema>;
