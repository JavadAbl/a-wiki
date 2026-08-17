import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z.string("نام مورد نیاز است"),

  description: z
    .string({
      message: "توضیحات باید رشته باشد",
    })
    .max(1000, "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد")
    .optional(),

  icon: z
    .string({
      message: "آیکون باید رشته باشد",
    })
    .optional(),
});

export type CategoryCreateDto = z.infer<typeof CategoryCreateSchema>;
