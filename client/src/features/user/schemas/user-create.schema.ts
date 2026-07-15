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

  mobile: z
    .string()
    .length(11, { message: "شماره موبایل باید دقیقاً ۱۱ کاراکتر باشد" })
    .regex(/^0(9[0-9]{2})\d{7}$/, "شماره موبایل صحیح نیست"),
});

export type UserCreateDto = z.infer<typeof UserCreateSchema>;
