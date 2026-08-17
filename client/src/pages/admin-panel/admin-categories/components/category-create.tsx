import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import { useCategoryCreateMutation } from "../../../../features/course/course-api";
import {
  CategoryCreateSchema,
  type CategoryCreateDto,
} from "../../../../features/course/schemas/category-create-schema";

// 100 KB in bytes
const MAX_FILE_SIZE = 75 * 1024;

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
}

export default function CategoryCreate({ isOpen, setIsOpen }: Props) {
  const form = useForm<CategoryCreateDto>({
    resolver: zodResolver(CategoryCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
    },
  });

  const [mutateCreateCategory, { isLoading }] = useCategoryCreateMutation();

  async function handleSubmit(data: CategoryCreateDto) {
    const res = await mutateCreateCategory(data);
    if (!res.error) {
      setIsOpen(false);
      form.reset();
    }
  }

  // Handler for file input change
  const handleIconChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: any,
  ) => {
    const file = event.target.files?.[0];

    // Reset value if no file is selected
    if (!file) {
      field.onChange("");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      form.setError("icon", {
        type: "manual",
        message: "حجم تصویر نباید بیشتر از 100 کیلوبایت باشد",
      });
      // Clear the input so the user can select a new file
      event.target.value = "";
      field.onChange("");
      return;
    }

    // Validate file type (ensure it's an image)
    if (!file.type.startsWith("image/")) {
      form.setError("icon", {
        type: "manual",
        message: "لطفاً فقط فایل تصویری آپلود کنید",
      });
      event.target.value = "";
      field.onChange("");
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      field.onChange(base64String);
      form.clearErrors("icon"); // Clear any previous errors
    };
    reader.onerror = () => {
      form.setError("icon", {
        type: "manual",
        message: "خطا در پردازش فایل. لطفاً دوباره تلاش کنید.",
      });
    };
    reader.readAsDataURL(file);
  };

  // Get current icon value for preview
  const iconPreview = form.watch("icon");

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ایجاد دسته بندی جدید">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-4 py-4 px-[40px]")}
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

        {/* New Icon Controller */}
        <Controller
          name="icon"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="icon">آیکون</FieldLabel>

              {/* Image Preview */}
              {iconPreview && (
                <div className="mb-2">
                  <img
                    src={iconPreview}
                    alt="پیش‌نمایش آیکون"
                    className="w-16 h-16 object-cover rounded-lg border border-gray"
                  />
                </div>
              )}

              <input
                id="icon"
                type="file"
                accept="image/*"
                onChange={(e) => handleIconChange(e, field)}
                className={cn(
                  "flex w-full rounded-[16px] border border-gray px-4 py-3 text-sm file:ml-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white hover:file:bg-primary/90",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />

              {/* Show error if exists, otherwise show hint */}
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
            className={cn("self-end rounded-[24px] min-w-[75px]")}
          >
            ایجاد
          </Button>

          <Button
            type="button"
            variant={"secondary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
            isLoading={isLoading}
            onClick={() => setIsOpen(false)}
          >
            انصراف
          </Button>
        </div>
      </form>
    </Modal>
  );
}
