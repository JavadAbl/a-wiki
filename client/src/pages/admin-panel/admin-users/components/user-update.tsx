import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import { useUserUpdateMutation } from "../../../../features/user/user-api";
import type { UserDto } from "../../../../features/user/dto/user.dto";
import { useEffect } from "react";
import {
  UserUpdateSchema,
  type UserUpdateDto,
} from "../../../../features/user/schemas/user-update.schema";

interface Props {
  close: () => any;
  user?: UserDto | null;
}

export default function UserUpdate({ close, user }: Props) {
  const form = useForm<UserUpdateDto>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
    },
    mode: "onSubmit",
  });

  const [mutateUpdateUser] = useUserUpdateMutation();

  useEffect(() => {
    const run = () => {
      if (user)
        form.setValues({
          firstName: user?.firstName,
          lastName: user?.lastName,
          mobile: user?.mobile,
        });
    };

    run();
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (data: UserUpdateDto) => {
    const res = await mutateUpdateUser({ body: data, userId: user.id });
    if (!res.error) {
      close();
      form.reset();
    }
  };

  return (
    <Modal open={!!user} onOpenChange={close} title="ایجا کاربر جدید">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-0 py-4 px-[40px]")}
      >
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">نام کوچک </FieldLabel>
              <FormInput
                {...field}
                id="firstName"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        <Controller
          name="lastName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="description">نام خانوادگی</FieldLabel>
              <FormInput
                {...field}
                id="lastName"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        <Controller
          name="mobile"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="description">مویابل </FieldLabel>
              <FormInput
                {...field}
                id="lastName"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        <div className={cn("flex justify-end gap-1 pt-2")}>
          <Button
            type="submit"
            variant={"primary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
          >
            ایجاد
          </Button>

          <Button
            type="button"
            variant={"secondary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
            onClick={() => close()}
          >
            انصراف
          </Button>
        </div>
      </form>
    </Modal>
  );
}
