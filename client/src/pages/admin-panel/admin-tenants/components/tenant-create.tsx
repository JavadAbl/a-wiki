import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import { useTenantCreateMutation } from "../../../../features/tenant/tenant-api";
import {
  TenantSchema,
  type TenantFormDto,
} from "../../../../features/tenant/schemas/tenant-schema";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
}

export default function TenantCreate({ isOpen, setIsOpen }: Props) {
  const form = useForm<TenantFormDto>({
    resolver: zodResolver(TenantSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logoUrl: "",
      order: 0,
    },
  });

  const [mutateCreateTenant, { isLoading }] = useTenantCreateMutation();

  async function handleSubmit(data: TenantFormDto) {
    const res = await mutateCreateTenant({
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      logoUrl: data.logoUrl || undefined,
      order: data.order ?? 0,
      isActive: true,
    });
    if (!res.error) {
      setIsOpen(false);
      form.reset();
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ایجاد نمونه جدید">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-4 py-4 px-[40px]")}
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tenant-name">نام</FieldLabel>
              <FormInput
                {...field}
                id="tenant-name"
                aria-invalid={fieldState.invalid}
                placeholder="مثال: شرکت نمونه یک"
                autoComplete="off"
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tenant-slug">شناسه (انگلیسی)</FieldLabel>
              <FormInput
                {...field}
                id="tenant-slug"
                aria-invalid={fieldState.invalid}
                placeholder="company-one"
                autoComplete="off"
                dir="ltr"
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tenant-description">توضیحات</FieldLabel>
              <textarea
                {...field}
                id="tenant-description"
                aria-invalid={fieldState.invalid}
                placeholder="توضیح کوتاه نمایش داده‌شده در صفحه انتخاب (اختیاری)"
                autoComplete="off"
                rows={3}
                className={cn(
                  "flex w-full rounded-[16px] border border-gray px-4 py-3 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 ",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "resize-none",
                )}
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        <Controller
          name="logoUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tenant-logo">آدرس لوگو</FieldLabel>
              <FormInput
                {...field}
                id="tenant-logo"
                aria-invalid={fieldState.invalid}
                placeholder="/static/images/logo.webp (اختیاری)"
                autoComplete="off"
                dir="ltr"
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        <Controller
          name="order"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tenant-order">ترتیب نمایش</FieldLabel>
              <FormInput
                {...field}
                id="tenant-order"
                type="number"
                aria-invalid={fieldState.invalid}
                placeholder="0"
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
            isLoading={isLoading}
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
