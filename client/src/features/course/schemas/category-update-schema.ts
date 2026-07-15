import { z } from "zod";

export const CategoryUpdateSchema = z.object({
  name: z.string("نام مورد نیاز است"),

  description: z
    .string({
      message: "توضیحات باید رشته باشد",
    })
    .max(1000, "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد")
    .optional(),
});

export type CategoryUpdateDto = z.infer<typeof CategoryUpdateSchema>;
