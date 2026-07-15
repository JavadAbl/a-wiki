import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import { useUserCreateMutation } from "../../../../features/user/user-api";
import {
  UserCreateSchema,
  type UserCreateDto,
} from "../../../../features/user/schemas/user-create.schema";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
}

export default function UserCreate({ isOpen, setIsOpen }: Props) {
  const form = useForm<UserCreateDto>({
    resolver: zodResolver(UserCreateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
    },
    mode: "onSubmit",
  });

  const [mutateCreateUser] = useUserCreateMutation();

  async function handleSubmit(data: UserCreateDto) {
    const res = await mutateCreateUser(data);
    if (!res.error) {
      setIsOpen(false);
      form.reset();
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ایجا کاربر جدید">
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
            onClick={() => setIsOpen(false)}
          >
            انصراف
          </Button>
        </div>
      </form>
    </Modal>
  );
}
