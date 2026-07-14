import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select"; // <-- new import

import { Field, FieldLabel } from "#components/ui/field";

import { toast } from "sonner";
import { InputMessage } from "#components/inputs/input-message";
import {
  CourseCreateSchema,
  type CourseCreateDto,
} from "../../../../features/course/schemas/course-create-schema";
import {
  useCategoryGetManyQuery,
  useCourseCreateMutation,
} from "../../../../features/course/course-api";
import { reactSelectStyles } from "../../../../utils/react-select-styles";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
}

export default function CourseCreate({ isOpen, setIsOpen }: Props) {
  const form = useForm<CourseCreateDto>({
    resolver: zodResolver(CourseCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      lecturer: "",
      lecturerProfession: "",
      categoryId: undefined,
    },
  });

  const [mutateCreateCourse] = useCourseCreateMutation();
  const { data: categoriesRes } = useCategoryGetManyQuery();
  const categories = categoriesRes?.items ?? [];

  // Format options for react-select
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  async function handleSubmit(data: CourseCreateDto) {
    const res = await mutateCreateCourse(data);
    if (!res.error) {
      toast.success("دوره با موفقیت ایجاد شد");
      setIsOpen(false);
      form.reset();
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ایجاد دوره جدید">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-0 py-4 px-[40px]")}
      >
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">عنوان دوره</FieldLabel>
              <FormInput
                {...field}
                id="title"
                aria-invalid={fieldState.invalid}
                placeholder="عنوان دوره را وارد کنید"
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
                placeholder="توضیحات دوره را وارد کنید (اختیاری)"
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

        <div className={cn("grid grid-cols-2 gap-4")}>
          <Controller
            name="lecturer"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="lecturer">نام مدرس</FieldLabel>
                <FormInput
                  {...field}
                  id="lecturer"
                  aria-invalid={fieldState.invalid}
                  placeholder="نام مدرس (اختیاری)"
                  autoComplete="off"
                />
                <InputMessage>{fieldState.error?.message}</InputMessage>
              </Field>
            )}
          />

          <Controller
            name="lecturerProfession"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="lecturerProfession">حرفه مدرس</FieldLabel>
                <FormInput
                  {...field}
                  id="lecturerProfession"
                  aria-invalid={fieldState.invalid}
                  placeholder="حرفه مدرس (اختیاری)"
                  autoComplete="off"
                />
                <InputMessage>{fieldState.error?.message}</InputMessage>
              </Field>
            )}
          />
        </div>

        {/* Category field with react-select */}
        <Controller
          name="categoryId"
          control={form.control}
          render={({ field, fieldState }) => {
            const selectedOption = categoryOptions.find(
              (opt) => opt.value === field.value,
            );

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="categoryId">دسته‌بندی</FieldLabel>
                <Select
                  id="categoryId"
                  options={categoryOptions}
                  value={selectedOption ?? null}
                  onChange={(option) =>
                    field.onChange(option ? option.value : undefined)
                  }
                  placeholder="انتخاب دسته‌بندی (اختیاری)"
                  isClearable
                  // --- FIX: portal + positioning ---
                  menuPortalTarget={document.body} // renders menu outside the modal
                  menuPosition="fixed" // avoids scroll issues
                  maxMenuHeight={200} // optional: limit height
                  styles={reactSelectStyles}
                />
                <InputMessage>{fieldState.error?.message}</InputMessage>
              </Field>
            );
          }}
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
