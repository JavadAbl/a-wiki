import { z } from "zod";

export const UserCreateSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "نام الزامی است" })
    .max(100, { message: "نام حداکثر ۱۰۰ کاراکتر می‌باشد" }),

  lastName: z
    .string()
    .min(1, { message: "نام خانوادگی الزامی است" })
    .max(100, { message: "نام خانوادگی حداکثر ۱۰۰ کاراکتر می‌باشد" }),

  nationalCode: z
    .string()
    .length(10, { message: " کدملی باید دقیقاً ۱0 کاراکتر باشد" }),

  mobile: z
    .string()
    .length(11, { message: "شماره موبایل باید دقیقاً ۱۱ کاراکتر باشد" })
    .regex(/^0[0-9]{10}$/, "شماره موبایل صحیح نیست")
    .optional(),
});

export type UserCreateDto = z.infer<typeof UserCreateSchema>;
