import { z } from "zod";

export const LoginSchema = z.object({
  mobile: z
    .string("نام کاربری مورد نیاز است")
    .regex(/^[0-9+\-\s()]{10,}$/, "شماره موبایل اشتباه است"),

  password: z.string("رمز عبور مورد نیاز است"),
});

export type LoginDto = z.infer<typeof LoginSchema>;
