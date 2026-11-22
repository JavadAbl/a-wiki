import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import { cn } from "#lib/utils";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCategoryGetManyQuery,
  useCoursesGetManyAdminQuery,
} from "../../../../features/course/course-api";
import {
  useGroupCreateMutation,
  useGroupSetCategoriesMutation,
  useGroupSetCoursesMutation,
  useGroupUpdateMutation,
  useLazyGroupGetByIdQuery,
} from "../../../../features/group/group-api";
import {
  GroupCreateSchema,
  type GroupCreateDto,
} from "../../../../features/group/schemas/group-create.schema";
import type { GroupDto } from "../../../../features/group/dto/group.dto";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  group?: GroupDto | null;
}

/// Create/edit modal for a group, including its course/category allowlist.
export default function GroupForm({ open, onClose, group }: Props) {
  const isEdit = !!group;
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [rulesLoaded, setRulesLoaded] = useState(!isEdit);

  const form = useForm<GroupCreateDto>({
    resolver: zodResolver(GroupCreateSchema),
    defaultValues: { name: "", description: "" },
    mode: "onSubmit",
  });

  const { data: categoriesRes } = useCategoryGetManyQuery({ pageSize: 1000 });
  const { data: coursesRes } = useCoursesGetManyAdminQuery({ pageSize: 1000, page: 1 });
  const [loadGroup] = useLazyGroupGetByIdQuery();

  const [mutateCreate, { isLoading: isCreating }] = useGroupCreateMutation();
  const [mutateUpdate, { isLoading: isUpdating }] = useGroupUpdateMutation();
  const [mutateSetCourses, { isLoading: isSettingCourses }] = useGroupSetCoursesMutation();
  const [mutateSetCategories, { isLoading: isSettingCategories }] = useGroupSetCategoriesMutation();

  const isLoading = isCreating || isUpdating || isSettingCourses || isSettingCategories;
  const categories = categoriesRes?.items ?? [];
  const courses = coursesRes?.items ?? [];

  useEffect(() => {
    if (!open) return;
    setSelectedCategories([]);
    setSelectedCourses([]);
    setRulesLoaded(!isEdit);
    if (isEdit && group) {
      form.setValue("name", group.name);
      form.setValue("description", group.description ?? "");
      loadGroup(group.id)
        .unwrap()
        .then((details) => {
          setSelectedCategories(details.categoryIds);
          setSelectedCourses(details.courseIds);
          setRulesLoaded(true);
        })
        .catch(() => setRulesLoaded(true));
    } else {
      form.reset({ name: "", description: "" });
    }
  }, [open, group, isEdit]);

  const toggle = (list: number[], setList: (v: number[]) => void, id: number) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSubmit = async (data: GroupCreateDto) => {
    const payload = { name: data.name, description: data.description || null };
    let groupId: number;
    if (isEdit && group) {
      const res = await mutateUpdate({ groupId: group.id, body: payload });
      if (res.error) return;
      groupId = group.id;
    } else {
      const res = await mutateCreate(payload);
      if (res.error || res.data == null) return;
      groupId = res.data;
    }

    const [coursesRes, categoriesRes] = await Promise.all([
      mutateSetCourses({ groupId, courseIds: selectedCourses }),
      mutateSetCategories({ groupId, categoryIds: selectedCategories }),
    ]);
    if (coursesRes.error || categoriesRes.error) {
      toast.error("ذخیره قوانین دسترسی ناموفق بود");
      return;
    }
    onClose();
    form.reset();
  };

  // Group courses by their category for display.
  const coursesByCategory = new Map<number | null, typeof courses>();
  for (const course of courses) {
    const key = course.categoryId ?? null;
    const list = coursesByCategory.get(key) ?? [];
    list.push(course);
    coursesByCategory.set(key, list);
  }
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? "بدون دسته بندی";

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={isEdit ? "ویرایش گروه" : "ایجاد گروه جدید"}
      className="max-h-[90vh] overflow-y-auto"
    >
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-4 py-4 px-[40px]")}
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">نام گروه</FieldLabel>
              <FormInput {...field} id="name" aria-invalid={fieldState.invalid} autoComplete="off" />
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
                rows={3}
                className={cn(
                  "flex w-full rounded-[16px] border border-gray px-4 py-3 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 resize-none",
                )}
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        <Field>
          <FieldLabel>دسته بندی های مجاز</FieldLabel>
          <p className="text-xs text-gray-500">
            کاربران این گروه تنها دوره هایی را میبینند که در این دسته بندی ها هستند یا به طور جداگانه انتخاب شده اند.
          </p>
          <div className="flex flex-wrap gap-2 rounded-xl border border-gray p-3">
            {categories.length === 0 && <span className="text-sm text-gray-500">دسته بندی ای وجود ندارد</span>}
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggle(selectedCategories, setSelectedCategories, category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </Field>

        <Field>
          <FieldLabel>دوره های مجاز</FieldLabel>
          {!rulesLoaded ? (
            <span className="text-sm text-gray-500">در حال بارگذاری...</span>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-xl border border-gray p-3">
              {courses.length === 0 && <span className="text-sm text-gray-500">دوره ای وجود ندارد</span>}
              {[...coursesByCategory.entries()].map(([categoryId, list]) => (
                <div key={categoryId ?? "none"} className="mb-3">
                  <div className="mb-1 text-xs font-semibold text-gray-600">
                    {categoryId == null ? "بدون دسته بندی" : categoryName(categoryId)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pr-2">
                    {list.map((course) => (
                      <label key={course.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => toggle(selectedCourses, setSelectedCourses, course.id)}
                        />
                        {course.title}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Field>

        <div className={cn("flex justify-end gap-1 pt-2")}>
          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="rounded-[24px] min-w-[75px]">
            ذخیره
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={onClose} className="rounded-[24px] min-w-[75px]">
            انصراف
          </Button>
        </div>
      </form>
    </Modal>
  );
}
