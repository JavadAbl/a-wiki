import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginSchema,
  type LoginDto,
} from "../../features/auth/schemas/login-schema";
import { Field, FieldLabel } from "#components/ui/field";
import { useLoginMutation } from "../../features/auth/auth-api";
import { useAppDispatch } from "#hooks/redux-hooks";
import { authActions } from "../../features/auth/auth-slice";
import { useNavigate } from "react-router";
import { sharedActions } from "../../features/shared/shared-slice";
import { InputMessage } from "#components/inputs/input-message";
import { useState } from "react";
import ResetPassword from "./reset-password";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
  redirect?: string | null;
}
export default function Login({ isOpen, setIsOpen, redirect }: Props) {
  const [isOpenResetPassword, setIsOpenResetPassword] = useState(false);
  const nav = useNavigate();
  const dis = useAppDispatch();
  const form = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const [mutateLogin] = useLoginMutation();

  async function handleLogin(data: LoginDto) {
    const res = await mutateLogin(data);
    if (!res.error) {
      const { accessToken, refreshToken, user } = res.data;
      dis(authActions.login({ accessToken, refreshToken, user }));
      dis(sharedActions.setIsOpenLogin({ isOpen: false }));
      if (redirect) nav(redirect);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ورود">
      {isOpenResetPassword && (
        <ResetPassword done={() => setIsOpenResetPassword(false)} />
      )}

      {!isOpenResetPassword && (
        <form
          onSubmit={form.handleSubmit(handleLogin)}
          className={cn("flex flex-col gap-[4px] py-4 px-[40px] ")}
        >
          <div>
            <Controller
              name="mobile"
              control={form.control}
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
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="">{" رمز عبور"} </FieldLabel>

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
          </div>

          <div className={cn("flex justify-between")}>
            <Button
              variant={"link"}
              onClick={() => setIsOpenResetPassword(true)}
            >
              {"فراموشی رمز عبور"}
            </Button>

            <div className={cn("flex justify-end gap-1 ")}>
              <Button
                type="submit"
                variant={"primary"}
                size={"lg"}
                className={cn(" self-end rounded-[24px]  min-w-[75px]")}
              >
                {"ورود"}
              </Button>

              <Button
                type="button"
                variant={"secondary"}
                size={"lg"}
                className={cn(" self-end rounded-[24px]   min-w-[75px]")}
                onClick={() =>
                  dis(sharedActions.setIsOpenLogin({ isOpen: false }))
                }
              >
                {"انصراف"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
