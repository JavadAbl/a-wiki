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
import { Field, FieldError, FieldGroup } from "#components/ui/field";
import { useLoginMutation } from "../../features/auth/auth-api";
import { toast } from "sonner";
import { useAppDispatch } from "#hooks/redux-hooks";
import { authActions } from "../../features/auth/auth-slice";
import { useNavigate } from "react-router";
import { sharedActions } from "../../features/shared/shared-slice";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
  redirect?: string;
}
export default function Login({ isOpen, setIsOpen, redirect }: Props) {
  const nav = useNavigate();
  const dis = useAppDispatch();
  const form = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  });

  const [mutateLogin] = useLoginMutation();

  async function handleLogin(data: LoginDto) {
    const res = await mutateLogin(data);
    if (!res.error) {
      const { accessToken, refreshToken, user } = res.data;
      dis(authActions.login({ accessToken, refreshToken, user }));
      toast.success("ورود موفقیت آمیز");
      dis(sharedActions.setIsOpenLogin({ isOpen: false }));
      if (redirect) nav(redirect);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ورود">
      <form
        onSubmit={form.handleSubmit(handleLogin)}
        className={cn("flex flex-col gap-[4px] py-4 px-[40px] ")}
      >
        <FieldGroup>
          <Controller
            name="mobile"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="" data-invalid={fieldState.invalid}>
                <FormInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="شماره موبایل"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FormInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="رمز عبور"
                  type="password"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          variant={"primary"}
          className={cn(
            " self-end rounded-[24px] font-bold! text-[14px]! p-[12px_16px]",
          )}
        >
          {"ورود"}
        </Button>
      </form>
    </Modal>
  );
}
