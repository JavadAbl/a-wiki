import { z } from "zod";

export const CourseUpdateSchema = z.object({
  title: z
    .string({
      message: "عنوان باید رشته باشد",
    })
    .min(1, "عنوان نمی‌تواند خالی باشد")
    .max(100, "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
    .optional(),

  description: z
    .string({
      message: "توضیحات باید رشته باشد",
    })
    .max(1000, "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد")
    .nullable()
    .optional(),

  lecturer: z
    .string({
      message: "نام مدرس باید رشته باشد",
    })
    .max(100, "نام مدرس نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
    .nullable()
    .optional(),

  lecturerProfession: z
    .string({
      message: "حرفه مدرس باید رشته باشد",
    })
    .max(100, "حرفه مدرس نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
    .nullable()
    .optional(),

  categoryId: z
    .number({
      message: "شناسه دسته‌بندی باید عدد باشد",
    })
    .int("شناسه دسته‌بندی باید عدد صحیح باشد")
    .nullable()
    .optional(),
});

export type CourseUpdateDto = z.infer<typeof CourseUpdateSchema>;
