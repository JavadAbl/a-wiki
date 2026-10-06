import { z } from "zod";

export const LinkSchema = z.object({
  title: z
    .string({
      message: "عنوان باید رشته باشد",
    })
    .max(100, "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
    .optional(),

  url: z
    .string({
      message: "آدرس مورد نیاز است",
    })
    .min(1, "آدرس الزامی است")
    .url("آدرس معتبر وارد کنید (مثال: https://example.com)")
    .max(1000, "آدرس نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد"),

  description: z
    .string({
      message: "توضیحات باید رشته باشد",
    })
    .max(1000, "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد")
    .optional(),

  order: z
    .number({
      message: "ترتیب باید عدد باشد",
    })
    .int()
    .min(0, "ترتیب نمی‌تواند منفی باشد")
    .optional(),
});

export type LinkDto = z.infer<typeof LinkSchema>;
