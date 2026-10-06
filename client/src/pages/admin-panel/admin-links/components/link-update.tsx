import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import { useLinkUpdateMutation } from "../../../../features/link/link-api";
import {
  LinkSchema,
  type LinkDto as LinkFormDto,
} from "../../../../features/link/schemas/link-schema";
import type { LinkDto } from "../../../../features/link/dto/link.dto";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
  link: LinkDto | null;
}

export default function LinkUpdate({ isOpen, setIsOpen, link }: Props) {
  const form = useForm<LinkFormDto>({
    resolver: zodResolver(LinkSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      order: 0,
    },
  });

  const [mutateUpdateLink, { isLoading }] = useLinkUpdateMutation();

  useEffect(() => {
    if (link) {
      form.reset({
        title: link.title ?? "",
        url: link.url,
        description: link.description ?? "",
        order: link.order ?? 0,
      });
    }
  }, [link, form]);

  if (!link) return null;

  const linkId = link.id;

  async function handleSubmit(data: LinkFormDto) {
    const res = await mutateUpdateLink({
      body: {
        url: data.url,
        title: data.title || undefined,
        description: data.description || undefined,
        order: data.order ?? 0,
      },
      linkId,
    });
    if (!res.error) {
      setIsOpen(false);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ویرایش لینک">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-4 py-4 px-[40px]")}
      >
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">عنوان</FieldLabel>
              <FormInput
                {...field}
                id="title"
                aria-invalid={fieldState.invalid}
                placeholder="عنوان لینک (اختیاری)"
                autoComplete="off"
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        <Controller
          name="url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="url">آدرس</FieldLabel>
              <FormInput
                {...field}
                id="url"
                aria-invalid={fieldState.invalid}
                placeholder="https://example.com"
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
              <FieldLabel htmlFor="description">توضیحات</FieldLabel>
              <textarea
                {...field}
                id="description"
                aria-invalid={fieldState.invalid}
                placeholder="توضیحات را وارد کنید (اختیاری)"
                autoComplete="off"
                rows={4}
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
          name="order"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="order">ترتیب نمایش</FieldLabel>
              <FormInput
                {...field}
                id="order"
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