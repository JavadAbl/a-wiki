import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import type { CategoryDto } from "../../../../features/course/dto/category.dto";
import {
  CategoryUpdateSchema,
  type CategoryUpdateDto,
} from "../../../../features/course/schemas/category-update-schema";
import { useCategoryUpdateMutation } from "../../../../features/course/course-api";
import { useEffect } from "react";

interface Props {
  close: () => any;
  category?: CategoryDto | null;
}

export default function CategoryUpdate({ close, category }: Props) {
  const form = useForm<CategoryUpdateDto>({
    resolver: zodResolver(CategoryUpdateSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  const [mutateUpdateCategory] = useCategoryUpdateMutation();

  useEffect(() => {
    const run = () => {
      if (category)
        form.setValues({
          name: category?.name,
          description: category?.description as any,
        });
    };

    run();
  }, [category]);

  if (!category) return null;

  async function handleSubmit(data: CategoryUpdateDto) {
    const res = await mutateUpdateCategory({
      categoryId: category!.id,
      body: data,
    });

    if (!res.error) {
      close();
      form.reset();
    }
  }

  return (
    <Modal open={!!category} onOpenChange={close} title="ویرایش دسته بندی">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-0 py-4 px-[40px]")}
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">عنوان</FieldLabel>
              <FormInput
                {...field}
                id="name"
                aria-invalid={fieldState.invalid}
                placeholder="عنوان را وارد کنید"
                autoComplete="off"
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

        <div className={cn("flex justify-end gap-1 pt-2")}>
          <Button
            type="submit"
            variant={"primary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
          >
            به‌روزرسانی
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
