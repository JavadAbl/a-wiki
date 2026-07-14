import { z } from "zod";

export const ContentCreateSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان نمی‌تواند خالی باشد")
    .max(100, "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),

  description: z
    .string()
    .max(1000, "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد")
    .optional(),
});

export type ContentCreateDto = z.infer<typeof ContentCreateSchema>;
