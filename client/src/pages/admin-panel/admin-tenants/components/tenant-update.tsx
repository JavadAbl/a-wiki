import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import { useTenantUpdateMutation } from "../../../../features/tenant/tenant-api";
import {
  TenantSchema,
  type TenantFormDto,
} from "../../../../features/tenant/schemas/tenant-schema";
import type { TenantDto } from "../../../../features/tenant/dto/tenant.dto";
import { useEffect } from "react";
import { storage } from "../../../../utils/storage";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
  tenant: TenantDto | null;
}

export default function TenantUpdate({ isOpen, setIsOpen, tenant }: Props) {
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

  const [mutateUpdateTenant, { isLoading }] = useTenantUpdateMutation();

  useEffect(() => {
    if (tenant) {
      form.reset({
        name: tenant.name,
        slug: tenant.slug,
        description: tenant.description ?? "",
        logoUrl: tenant.logoUrl ?? "",
        order: tenant.order ?? 0,
      });
    }
  }, [tenant, form]);

  if (!tenant) return null;

  const tenantId = tenant.id;

  async function handleSubmit(data: TenantFormDto) {
    const res = await mutateUpdateTenant({
      body: {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        logoUrl: data.logoUrl || undefined,
        order: data.order ?? 0,
      },
      tenantId,
    });
    if (!res.error) {
      // if the current instance was renamed, refresh the stored chip
      const current = storage.getTenant();
      if (current?.id === tenantId) {
        storage.setTenant({ ...current, name: data.name, slug: data.slug });
      }
      setIsOpen(false);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ویرایش نمونه">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-4 py-4 px-[40px]")}
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tenant-name-u">نام</FieldLabel>
              <FormInput
                {...field}
                id="tenant-name-u"
                aria-invalid={fieldState.invalid}
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
              <FieldLabel htmlFor="tenant-slug-u">شناسه (انگلیسی)</FieldLabel>
              <FormInput
                {...field}
                id="tenant-slug-u"
                aria-invalid={fieldState.invalid}
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
              <FieldLabel htmlFor="tenant-description-u">توضیحات</FieldLabel>
              <textarea
                {...field}
                id="tenant-description-u"
                aria-invalid={fieldState.invalid}
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
              <FieldLabel htmlFor="tenant-logo-u">آدرس لوگو</FieldLabel>
              <FormInput
                {...field}
                id="tenant-logo-u"
                aria-invalid={fieldState.invalid}
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
              <FieldLabel htmlFor="tenant-order-u">ترتیب نمایش</FieldLabel>
              <FormInput
                {...field}
                id="tenant-order-u"
                type="number"
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
            isLoading={isLoading}
          >
            ذخیره
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
