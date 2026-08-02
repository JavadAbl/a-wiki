import { FormInput } from "#components/inputs/input";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import { z } from "zod";
import {
  ResetPasswordSchema,
  type ResetPasswordDto,
} from "../../features/auth/schemas/reset-password-schema";
import { useResetPasswordMutation } from "../../features/auth/auth-api";
import { Modal } from "#components/modals/modal";
// Note: Make sure to export useResetPasswordMutation from your auth-api

// Extend the schema to include confirm password for client-side validation only
const FormResetPasswordSchema = ResetPasswordSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "رمز عبور و تکرار آن یکسان نیستند", // "Passwords do not match"
  path: ["confirmPassword"], // Set the error on the confirm field
});

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
}

export default function NavbarResetPassword({ isOpen, setIsOpen }: Props) {
  const formResetPassword = useForm<z.infer<typeof FormResetPasswordSchema>>({
    resolver: zodResolver(FormResetPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const [mutateResetPassword, { isLoading: isLoadingResetPassword }] =
    useResetPasswordMutation();

  async function handleResetPassword(
    data: z.infer<typeof FormResetPasswordSchema>,
  ) {
    // Destructure to remove confirmPassword so it's not sent to the server
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = data;

    const res = await mutateResetPassword(payload as ResetPasswordDto);
    if (!res.error) setIsOpen(false);
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="تغییر رمز عبور">
      <form
        onSubmit={formResetPassword.handleSubmit(handleResetPassword)}
        className={cn("flex flex-col gap-[4px] py-4 px-[40px] ")}
        autoComplete="off"
      >
        <div>
          <Controller
            name="currentPassword"
            control={formResetPassword.control}
            render={({ field, fieldState }) => (
              <Field className="" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="">{"رمز عبور فعلی"} </FieldLabel>

                <FormInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="رمز عبور فعلی"
                  type="password"
                  autoComplete="off"
                />

                <InputMessage>{fieldState.error?.message}</InputMessage>
              </Field>
            )}
          />

          <Controller
            name="newPassword"
            control={formResetPassword.control}
            render={({ field, fieldState }) => (
              <Field className="" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="">{"رمز عبور جدید"} </FieldLabel>

                <FormInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="رمز عبور جدید"
                  type="password"
                  autoComplete="off"
                />

                <InputMessage>{fieldState.error?.message}</InputMessage>
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={formResetPassword.control}
            render={({ field, fieldState }) => (
              <Field className="" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="">{"تکرار رمز عبور جدید"} </FieldLabel>

                <FormInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="تکرار رمز عبور جدید"
                  type="password"
                  autoComplete="off"
                />

                <InputMessage>{fieldState.error?.message}</InputMessage>
              </Field>
            )}
          />
        </div>

        <div className={cn("flex justify-end gap-1 ")}>
          <Button
            type="submit"
            variant={"primary"}
            size={"lg"}
            isLoading={isLoadingResetPassword}
            className={cn(" self-end rounded-[24px] min-w-[75px]")}
          >
            {"ارسال"}
          </Button>

          <Button
            type="button"
            variant={"secondary"}
            size={"lg"}
            className={cn(" self-end rounded-[24px] min-w-[75px]")}
            onClick={() => setIsOpen(false)}
          >
            {"انصراف"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
