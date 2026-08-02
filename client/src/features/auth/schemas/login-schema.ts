import { z } from "zod";

export const LoginSchema = z.object({
  mobile: z
    .string("شماره موبایل مورد نیاز است")
    .regex(/^0[0-9]{10}$/, "شماره موبایل اشتباه است"),

  password: z.string("رمز عبور مورد نیاز است"),
});

export type LoginDto = z.infer<typeof LoginSchema>;

/* export const LoginSchema = z.object({
  mobile: z
    .string("شماره موبایل مورد نیاز است")
    .refine(
      (val) => val === "admin" || /^[0-9+\-\s()]{10,}$/.test(val),
      "شماره موبایل اشتباه است",
    ),

  password: z.string("رمز عبور مورد نیاز است"),
});

export type LoginDto = z.infer<typeof LoginSchema>;
 */
