import { z } from "zod";

export const CourseCreateSchema = z.object({
  title: z
    .string({
      message: "عنوان باید رشته باشد",
    })
    .min(1, "عنوان نمی‌تواند خالی باشد")
    .max(100, "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),

  description: z
    .string({
      message: "توضیحات باید رشته باشد",
    })
    .max(1000, "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد")
    .optional(),

  lecturer: z
    .string({
      message: "نام مدرس باید رشته باشد",
    })
    .max(100, "نام مدرس نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
    .optional(),

  lecturerProfession: z
    .string({
      message: "حرفه مدرس باید رشته باشد",
    })
    .max(100, "حرفه مدرس نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
    .optional(),

  categoryId: z
    .number({
      message: "شناسه دسته‌بندی باید عدد باشد",
    })
    .int("شناسه دسته‌بندی باید عدد صحیح باشد")
    .optional(),
});

export type CourseCreateDto = z.infer<typeof CourseCreateSchema>;
