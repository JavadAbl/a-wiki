import { Separator } from "#components/ui/separator";
import { useState, useMemo, useEffect } from "react";
import CoursesHeader from "./components/courses-header";
import type { CategoryDto } from "../../../features/course/dto/category.dto";
import {
  useCoursesGetManyQuery,
  useCategoryGetManyQuery,
} from "../../../features/course/course-api";
import { cn } from "#lib/utils";
import CoursesGridCard from "./components/courses-grid-card";
import CoursesListCard from "./components/courses-list-card";
import LoadingContainer from "#components/utils/loading-container";
import { useSearchParams } from "react-router";
import { Show } from "#components/utils/show";
import { CoursesEmptyState } from "./components/courses-empty-state";

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search");
  const categoryId = searchParams.get("categoryId");

  const [selectedView, setSelectedView] = useState<"Grid" | "List">("Grid");

  // Fetch categories at the parent level so we can resolve the selected CategoryDto from the ID in the URL
  const { data: categoriesRes } = useCategoryGetManyQuery();
  const categories = useMemo(() => categoriesRes?.items || [], [categoriesRes]);

  // Resolve the selected category object based on the query string ID
  const selectedCategory = useMemo<CategoryDto | null>(() => {
    if (!categoryId || !categories.length) return null;
    return categories.find((c) => c.id === Number(categoryId)) || null;
  }, [categoryId, categories]);

  const { data: coursesRes, isFetching } = useCoursesGetManyQuery({
    pageSize: 1000,
    page: 1,
    search: search ? search : undefined,
    categoryId: categoryId ? Number(categoryId) : undefined, // Pass the ID directly to the API query
  });

  const courses = coursesRes?.items;

  const handleCategoryChange = (category: CategoryDto | null) => {
    // Update the query string instead of local state
    const nextParams = new URLSearchParams(searchParams);
    if (category) {
      nextParams.set("categoryId", category.id);
    } else {
      nextParams.delete("categoryId");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleClearFilters = () => {
    // Clear all filters from the query string smoothly
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    nextParams.delete("categoryId");
    setSearchParams(nextParams, { replace: true });
  };

  const hasCourses = courses && courses.length > 0;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className={cn(" bg-surface-300 blur-in  ")}>
      <Separator />

      <CoursesHeader
        categories={categories}
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
        onViewChange={setSelectedView}
        selectedView={selectedView}
      />

      <LoadingContainer isLoading={isFetching} minHeight="min-h-screen">
        <div className={cn(" container mx-auto p-[48px_8px] lg:p-[48px_4px]")}>
          <Show
            when={hasCourses}
            fallback={
              <CoursesEmptyState
                search={search}
                category={selectedCategory}
                onClearFilters={handleClearFilters}
              />
            }
          >
            <>
              {/* Grid View */}
              <Show when={selectedView === "Grid"}>
                <div
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[16px] gap-y-[32px]",
                  )}
                >
                  {courses?.map((course) => (
                    <CoursesGridCard key={course.id} course={course} />
                  ))}
                </div>
              </Show>

              {/* List View */}
              <Show when={selectedView === "List"}>
                <div
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-2 gap-x-[16px] gap-y-[32px]",
                  )}
                >
                  {courses?.map((course) => (
                    <CoursesListCard key={course.id} course={course} />
                  ))}
                </div>
              </Show>
            </>
          </Show>
        </div>
      </LoadingContainer>
    </div>
  );
}
