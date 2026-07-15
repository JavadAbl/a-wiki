import { z } from "zod";

export const SendOtpSchema = z.object({
  mobile: z
    .string("شماره موبایل مورد نیاز است")
    .regex(/^[0-9+\-\s()]{10,}$/, "شماره موبایل اشتباه است"),
});

export type SendOtpDto = z.infer<typeof SendOtpSchema>;
