import { FormInput } from "#components/inputs/input";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import {
  ResetPasswordSchema,
  type ResetPasswordDto,
} from "../../features/auth/schemas/reset-password-schema";
import {
  useResetPasswordOtpMutation,
  useSendOtpMutation,
} from "../../features/auth/auth-api";
import {
  SendOtpSchema,
  type SendOtpDto,
} from "../../features/auth/schemas/send-otp-schema";
import { useState } from "react";

interface Props {
  done: () => any;
}
export default function ResetPassword({ done }: Props) {
  const [step, setStep] = useState<"otp" | "reset">("otp");
  const formResetPassword = useForm<ResetPasswordDto>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      mobile: "",
      newPassword: "",
      otp: "",
    },
    mode: "onSubmit",
  });

  const formSendOtp = useForm<SendOtpDto>({
    resolver: zodResolver(SendOtpSchema),
    defaultValues: {
      mobile: "",
    },
    mode: "onSubmit",
  });

  const [mutateResetPassword, { isLoading: isLoadingResetPassword }] =
    useResetPasswordOtpMutation();
  const [mutateSendOtp, { isLoading: isLoadingSendOtp }] = useSendOtpMutation();

  async function handleResetPassword(data: ResetPasswordDto) {
    const res = await mutateResetPassword(data);
    if (!res.error) done();
  }

  async function handleSendOtp(data: SendOtpDto) {
    const res = await mutateSendOtp(data);
    if (!res.error) setStep("reset");
  }

  if (step === "otp")
    return (
      <form
        onSubmit={formSendOtp.handleSubmit(handleSendOtp)}
        className={cn("flex flex-col gap-[4px] py-4 px-[40px] ")}
      >
        <div>
          <Controller
            name="mobile"
            control={formSendOtp.control}
            render={({ field, fieldState }) => (
              <Field className="" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="">{"شماره موبایل"} </FieldLabel>

                <FormInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="شماره موبایل"
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
            isLoading={isLoadingSendOtp}
            className={cn(" self-end rounded-[24px]  min-w-[75px]")}
          >
            {"ارسال کد تایید"}
          </Button>

          <Button
            type="button"
            variant={"secondary"}
            size={"lg"}
            className={cn(" self-end rounded-[24px]   min-w-[75px]")}
            onClick={done}
          >
            {"انصراف"}
          </Button>
        </div>
      </form>
    );

  if (step === "reset")
    return (
      <form
        onSubmit={formResetPassword.handleSubmit(handleResetPassword)}
        className={cn("flex flex-col gap-[4px] py-4 px-[40px] ")}
      >
        <div>
          <Controller
            name="mobile"
            control={formResetPassword.control}
            render={({ field, fieldState }) => (
              <Field className="" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="">{"شماره موبایل"} </FieldLabel>

                <FormInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="شماره موبایل"
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
                <FieldLabel htmlFor="">{"رمز عبور"} </FieldLabel>

                <FormInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="رمز عبور"
                  type="password"
                  autoComplete="off"
                />

                <InputMessage>{fieldState.error?.message}</InputMessage>
              </Field>
            )}
          />

          <Controller
            name="otp"
            control={formResetPassword.control}
            render={({ field, fieldState }) => (
              <Field className="" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="">{"کد ارسالی"} </FieldLabel>

                <FormInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="کد ارسالی"
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
            onClick={done}
          >
            {"انصراف"}
          </Button>
        </div>
      </form>
    );
}
