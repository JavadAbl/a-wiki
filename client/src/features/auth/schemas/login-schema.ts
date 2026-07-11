import { z } from "zod";

export const LoginSchema = z.object({
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[0-9+\-\s()]{10,}$/, "شماره موبایل اشتباه است"),

  password: z.string().nonempty("رمز عبور مورد نیاز است"),
});

export type LoginDto = z.infer<typeof LoginSchema>;
