import { z } from "zod";

export const GroupUpdateSchema = z.object({
  name: z
    .string("نام گروه الزامی است")
    .min(1, "نام گروه الزامی است")
    .max(100, "نام گروه حداکثر ۱۰۰ کاراکتر میباشد")
    .optional(),

  description: z
    .string()
    .max(1000, "توضیحات حداکثر ۱۰۰۰ کاراکتر میباشد")
    .optional(),
});

export type GroupUpdateDto = z.infer<typeof GroupUpdateSchema>;
