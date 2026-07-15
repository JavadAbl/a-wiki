import { z } from "zod";

export const LoginSchema = z.object({
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[0-9+\-\s()]{10,}$/, "Invalid mobile number format"),
});

export type LoginDto = z.infer<typeof LoginSchema>;
