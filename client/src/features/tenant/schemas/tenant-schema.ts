import { z } from "zod";

export const TenantSchema = z.object({
  name: z
    .string({
      message: "نام باید رشته باشد",
    })
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),

  slug: z
    .string({
      message: "شناسه مورد نیاز است",
    })
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{1,48}[a-zA-Z0-9])?$/,
      "شناسه باید ۳ تا ۵۰ کاراکتر لاتین، رقم، - یا _ باشد",
    ),

  description: z
    .string({
      message: "توضیحات باید رشته باشد",
    })
    .max(500, "توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد")
    .optional(),

  logoUrl: z
    .string({
      message: "آدرس لوگو باید رشته باشد",
    })
    .max(1000, "آدرس لوگو نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد")
    .optional(),

  order: z
    .number({
      message: "ترتیب باید عدد باشد",
    })
    .int()
    .min(0, "ترتیب نمی‌تواند منفی باشد")
    .optional(),
});

export type TenantFormDto = z.infer<typeof TenantSchema>;
