import { z } from "zod";

export const ResetPasswordSchema = z.object({
  mobile: z
    .string("شماره موبایل مورد نیاز است")
    .regex(/^[0-9+\-\s()]{10,}$/, "شماره موبایل اشتباه است"),

  newPassword: z.string("رمز عبور مورد نیاز است"),
  otp: z.string("رمز یکبار مصرف الزامی است"),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
