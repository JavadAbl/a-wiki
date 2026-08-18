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
import { ChevronLeft, ChevronRight } from "lucide-react";
import LoadingContainer from "#components/utils/loading-container";
import { useSearchParams } from "react-router";
import { Show } from "#components/utils/show";
import { CoursesEmptyState } from "./components/courses-empty-state";

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search");
  const categoryId = searchParams.get("categoryId");

  const [selectedView, setSelectedView] = useState<"Grid" | "List">("Grid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch categories at the parent level so we can resolve the selected CategoryDto from the ID in the URL
  const { data: categoriesRes } = useCategoryGetManyQuery();
  const categories = useMemo(() => categoriesRes?.items || [], [categoriesRes]);

  // Resolve the selected category object based on the query string ID
  const selectedCategory = useMemo<CategoryDto | null>(() => {
    if (!categoryId || !categories.length) return null;
    return categories.find((c) => c.id === Number(categoryId)) || null;
  }, [categoryId, categories]);

  const { data: coursesRes, isFetching } = useCoursesGetManyQuery({
    pageSize,
    page: currentPage,
    search: search ? search : undefined,
    categoryId: categoryId ? Number(categoryId) : undefined, // Pass the ID directly to the API query
  });

  const courses = coursesRes?.items;
  const coursesCount = coursesRes?.totalCount || 0;

  const totalPages = useMemo(
    () => Math.ceil(coursesCount / pageSize),
    [coursesCount],
  );

  const handleCategoryChange = (category: CategoryDto | null) => {
    // Update the query string instead of local state
    const nextParams = new URLSearchParams(searchParams);
    if (category) {
      nextParams.set("categoryId", category.id);
    } else {
      nextParams.delete("categoryId");
    }
    setSearchParams(nextParams, { replace: true });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    // Clear all filters from the query string smoothly
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    nextParams.delete("categoryId");
    setSearchParams(nextParams, { replace: true });
    setCurrentPage(1);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  const hasCourses = courses && courses.length > 0;

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

              {/* Pagination */}
              <Show when={totalPages > 1}>
                <div
                  className="flex items-center justify-center gap-3 mt-16"
                  dir="ltr"
                >
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isFetching}
                    className="p-2 rounded-md border border-border/40 hover:bg-surface-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="صفحه قبلی"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Logic to show ellipsis dots
                        if (
                          totalPages > 7 &&
                          page !== 1 &&
                          page !== totalPages &&
                          Math.abs(page - currentPage) > 1
                        ) {
                          if (page === 2 || page === totalPages - 1) {
                            return (
                              <span
                                key={page}
                                className="w-8 h-8 flex items-center justify-center text-muted-foreground select-none"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            disabled={isFetching}
                            className={cn(
                              "w-[48px] h-[48px] flex items-center justify-center rounded-[14px] text-sm font-medium transition-colors",
                              currentPage === page
                                ? "bg-primary-400 text-primary-foreground"
                                : "hover:bg-surface-200 text-foreground",
                            )}
                          >
                            {page}
                          </button>
                        );
                      },
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || isFetching}
                    className="p-2 rounded-md border border-border/40 hover:bg-surface-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="صفحه بعدی"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </Show>
            </>
          </Show>
        </div>
      </LoadingContainer>
    </div>
  );
}
