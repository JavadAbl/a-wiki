import { Separator } from "#components/ui/separator";
import { useState } from "react";
import CoursesHeader from "./components/courses-header";
import type { CategoryDto } from "../../../features/course/dto/category.dto";
import { useCoursesGetManyQuery } from "../../../features/course/course-api";
import { cn } from "#lib/utils";
import CoursesGridCard from "./components/courses-grid-card";

export default function Courses() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const [selectedView, setSelectedView] = useState<"Grid" | "List">("Grid");

  //Data Hooks
  const { data: coursesRes } = useCoursesGetManyQuery({
    pageSize: 5,
    categoryId: selectedCategory ? selectedCategory.id : undefined,
  });
  const courses = coursesRes?.items;
  const coursesCount = coursesRes?.totalCount;

  return (
    <div className={cn(" bg-surface-300")}>
      <Separator />
      <CoursesHeader
        onCategoryChange={setSelectedCategory}
        onViewChange={setSelectedView}
        selectedCategory={selectedCategory}
        selectedView={selectedView}
      />

      <div className={cn(" container mx-auto p-[48px_0px] ")}>
        {selectedView === "Grid" && (
          <div className={cn("grid grid-cols-4 gap-x-[16px] gap-y-[32px]")}>
            {courses?.map((course) => (
              <CoursesGridCard course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
