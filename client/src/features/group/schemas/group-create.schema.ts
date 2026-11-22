import { z } from "zod";

export const GroupCreateSchema = z.object({
  name: z
    .string("نام گروه الزامی است")
    .min(1, "نام گروه الزامی است")
    .max(100, "نام گروه حداکثر ۱۰۰ کاراکتر میباشد"),

  description: z
    .string()
    .max(1000, "توضیحات حداکثر ۱۰۰۰ کاراکتر میباشد")
    .optional(),
});

export type GroupCreateDto = z.infer<typeof GroupCreateSchema>;
