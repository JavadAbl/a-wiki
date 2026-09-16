import { z } from "zod";

export const LoginSchema = z.object({
  nationalCode: z.string("کدملی مورد نیاز است"),

  password: z.string("رمز عبور مورد نیاز است"),
});

export type LoginDto = z.infer<typeof LoginSchema>;
