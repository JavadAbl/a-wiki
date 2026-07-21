import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import Select from "react-select";
import { Field, FieldLabel } from "#components/ui/field";
import { reactSelectStyles } from "../../../../utils/react-select-styles";
import {
  useCategoryGetManyQuery,
  useCourseUpdateMutation,
} from "../../../../features/course/course-api";
import type { CourseDto } from "../../../../features/course/dto/course.dto";
import { useEffect, useState } from "react";

interface Props {
  setIsOpen: (open: boolean) => any;
  course: CourseDto | null;
}

// 1. Define the shape of the option object
interface CategoryOption {
  value: number;
  label: string;
}

export default function CourseSetCategory({ setIsOpen, course }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    if (course) {
      setSelectedCategory(course.categoryId ?? null);
    }
  }, [course]);

  //Data Hooks
  const [mutateCourseUpdate] = useCourseUpdateMutation();
  const { data: categoriesRes } = useCategoryGetManyQuery();
  const categories = categoriesRes?.items ?? [];

  // 2. Type the options array
  const categoryOptions: CategoryOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  if (!course) return null;

  const handleSubmit = async () => {
    const res = await mutateCourseUpdate({
      body: { categoryId: selectedCategory },
      courseId: course.id,
    });
    if (!res.error) {
      setIsOpen(false);
    }
  };

  return (
    <Modal open={!!course} onOpenChange={setIsOpen} title="ایجاد دوره جدید">
      <div className={cn("flex flex-col gap-0 py-4 px-[40px]")}>
        <Field>
          <FieldLabel htmlFor="categoryId">دسته‌بندی</FieldLabel>

          {/* 3. Pass generic types to Select: <Option, IsMulti> */}
          <Select<CategoryOption, false>
            id="categoryId"
            options={categoryOptions}
            // 4. Find the object matching the state's number value
            value={
              categoryOptions.find((opt) => opt.value === selectedCategory) ??
              null
            }
            // 5. Extract the number value on change
            onChange={(option) =>
              setSelectedCategory(option ? option.value : null)
            }
            placeholder="انتخاب دسته‌بندی (اختیاری)"
            isClearable
            // --- FIX: portal + positioning ---
            menuPortalTarget={document.body} // renders menu outside the modal
            menuPosition="fixed" // avoids scroll issues
            maxMenuHeight={200} // optional: limit height
            styles={reactSelectStyles}
          />
        </Field>

        <div className={cn("flex justify-end gap-1 pt-2")}>
          <Button
            variant={"primary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
            onClick={handleSubmit}
          >
            اعمال تغییرات
          </Button>

          <Button
            variant={"secondary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
            onClick={() => setIsOpen(false)}
          >
            انصراف
          </Button>
        </div>
      </div>
    </Modal>
  );
}
