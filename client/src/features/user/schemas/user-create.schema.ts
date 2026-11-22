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
    .length(10, { message: " کدملی باید دقیقاً ۱۰ کاراکتر باشد" }),

  mobile: z
    .string()
    .refine(
      (val) => val === "" || /^0[0-9]{10}$/.test(val),
      "شماره موبایل صحیح نیست",
    )
    .optional(),

  groupId: z.string().nullable().optional(),
});

export type UserCreateDto = z.infer<typeof UserCreateSchema>;
