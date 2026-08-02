import { z } from "zod";

export const ResetPasswordSchema = z.object({
  currentPassword: z.string(),

  newPassword: z.string(),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
