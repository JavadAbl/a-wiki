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
import { useEffect, useRef } from "react";

// 100 KB in bytes
const MAX_FILE_SIZE = 75 * 1024;

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
      icon: category?.icon || "", // Initialize with existing icon
    },
  });

  const [mutateUpdateCategory, { isLoading }] = useCategoryUpdateMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category) {
      form.setValues({
        name: category.name,
        description: category.description as any,
        icon: category.icon || "", // Update icon if category changes
      });
    }
  }, [category, form]);

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

  const handleIconChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: any,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      form.setError("icon", {
        type: "manual",
        message: "حجم تصویر نباید بیشتر از 100 کیلوبایت باشد",
      });
      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      form.setError("icon", {
        type: "manual",
        message: "لطفاً فقط فایل تصویری آپلود کنید",
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      field.onChange(reader.result as string);
      form.clearErrors("icon");
    };
    reader.onerror = () => {
      form.setError("icon", {
        type: "manual",
        message: "خطا در پردازش فایل. لطفاً دوباره تلاش کنید.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveIcon = (field: any) => {
    field.onChange(""); // Set icon to empty string to remove it
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the native file input
    }
  };

  const iconPreview = form.watch("icon");

  return (
    <Modal open={!!category} onOpenChange={close} title="ویرایش دسته بندی">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-4 py-4 px-[40px]")} // Changed gap-0 to gap-4 for better spacing
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">عنوان</FieldLabel>
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

        {/* Icon Controller */}
        <Controller
          name="icon"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="icon">آیکون</FieldLabel>

              {/* Image Preview & Remove Button */}
              {iconPreview ? (
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={iconPreview}
                    alt="پیش‌نمایش آیکون"
                    className="w-16 h-16 object-cover rounded-lg border border-gray"
                  />
                  <Button
                    type="button"
                    variant={"secondary"}
                    size={"sm"}
                    className="rounded-[12px]"
                    onClick={() => handleRemoveIcon(field)}
                  >
                    حذف آیکون
                  </Button>
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                id="icon"
                type="file"
                accept="image/*"
                onChange={(e) => handleIconChange(e, field)}
                className={cn(
                  "flex size-[64px] rounded-[16px] border border-gray px-4 py-3 text-sm file:ml-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white hover:file:bg-primary/90",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />

              {fieldState.error ? (
                <InputMessage>{fieldState.error.message}</InputMessage>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  حداکثر حجم فایل: ۱۰۰ کیلوبایت
                </p>
              )}
            </Field>
          )}
        />

        <div className={cn("flex justify-end gap-1 pt-2")}>
          <Button
            type="submit"
            variant={"primary"}
            size={"lg"}
            isLoading={isLoading}
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
