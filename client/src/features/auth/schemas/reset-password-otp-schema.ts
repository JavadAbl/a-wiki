import { z } from "zod";

export const ResetPasswordOtpSchema = z.object({
  mobile: z
    .string("شماره موبایل مورد نیاز است")
    .regex(/^0[0-9]{10}$/, "شماره موبایل اشتباه است"),

  newPassword: z.string("رمز عبور مورد نیاز است"),
  otp: z.string("رمز یکبار مصرف الزامی است"),
});

export type ResetPasswordOtpDto = z.infer<typeof ResetPasswordOtpSchema>;
