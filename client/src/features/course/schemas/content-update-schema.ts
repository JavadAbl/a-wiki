import { z } from "zod";

export const ContentUpdateSchema = z.object({
  title: z.string("نام مورد نیاز است").optional(),

  description: z
    .string({
      message: "توضیحات باید رشته باشد",
    })
    .max(1000, "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد")
    .optional(),

  order: z.int("ترتیب باید عدد باشد").optional(),
});

export type ContentUpdateDto = z.infer<typeof ContentUpdateSchema>;
