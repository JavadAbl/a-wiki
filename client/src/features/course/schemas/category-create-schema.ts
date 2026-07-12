import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z.string("نام مورد نیاز است"),

  description: z.string("رمز عبور مورد نیاز است").nullable(),
});

export type CategoryCreateDto = z.infer<typeof CategoryCreateSchema>;
