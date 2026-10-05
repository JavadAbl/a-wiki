import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import Select from "react-select";
import { Field, FieldLabel } from "#components/ui/field";
import { reactSelectStyles } from "../../../../utils/react-select-styles";
import {
  useCoursesGetManyAdminQuery,
  useCourseSetRelatedCoursesMutation,
} from "../../../../features/course/course-api";
import type { CourseDetailsDto } from "../../../../features/course/dto/course.details.dto";
import { useEffect, useMemo, useState } from "react";

interface Props {
  setIsOpen: (open: boolean) => any;
  course: CourseDetailsDto | null;
}

interface CourseOption {
  value: number;
  label: string;
}

export default function CourseSetRelatedCourses({ setIsOpen, course }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (course) {
      const run = () =>
        setSelectedIds((course.relatedCourses ?? []).map((c) => c.id));
      run();
    }
  }, [course]);

  //Data Hooks
  const [mutateSetRelatedCourses] = useCourseSetRelatedCoursesMutation();
  const { data: coursesRes } = useCoursesGetManyAdminQuery({
    pageSize: 1000,
  });

  // Exclude the course itself from the options
  const courseOptions: CourseOption[] = useMemo(
    () =>
      (coursesRes?.items ?? [])
        .filter((c) => c.id !== course?.id)
        .map((c) => ({ value: c.id, label: c.title })),
    [coursesRes, course?.id],
  );

  if (!course) return null;

  const handleSubmit = async () => {
    const res = await mutateSetRelatedCourses({
      body: { relatedCourseIds: selectedIds },
      courseId: course.id,
    });
    if (!res.error) {
      setIsOpen(false);
    }
  };

  return (
    <Modal open={!!course} onOpenChange={setIsOpen} title="دوره‌های مرتبط">
      <div className={cn("flex flex-col gap-0 py-4 px-[40px]")}>
        <Field>
          <FieldLabel htmlFor="relatedCourseIds">
            دوره‌های مرتبط با «{course.title}»
          </FieldLabel>

          <Select<CourseOption, true>
            id="relatedCourseIds"
            isMulti
            options={courseOptions}
            value={courseOptions.filter((opt) => selectedIds.includes(opt.value))}
            onChange={(options) =>
              setSelectedIds(options.map((opt) => opt.value))
            }
            placeholder="دوره‌ها را انتخاب کنید..."
            // --- portal + positioning (same as category picker) ---
            menuPortalTarget={document.body}
            menuPosition="fixed"
            maxMenuHeight={200}
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