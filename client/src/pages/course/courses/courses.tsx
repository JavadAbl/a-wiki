import { Separator } from "#components/ui/separator";
import { useState, useMemo, useEffect } from "react";
import CoursesHeader from "./components/courses-header";
import type { CategoryDto } from "../../../features/course/dto/category.dto";
import { useCoursesGetManyQuery } from "../../../features/course/course-api";
import { cn } from "#lib/utils";
import CoursesGridCard from "./components/courses-grid-card";
import CoursesListCard from "./components/courses-list-card";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icons (assuming lucide-react)
import LoadingContainer from "#components/utils/loading-container";

export default function Courses() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const [selectedView, setSelectedView] = useState<"Grid" | "List">("Grid");

  // 1. Add current page state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 2. Pass currentPage to the query hook
  const { data: coursesRes, isFetching } = useCoursesGetManyQuery({
    pageSize,
    page: currentPage,
    categoryId: selectedCategory ? selectedCategory.id : undefined,
  });

  const courses = coursesRes?.items;
  const coursesCount = coursesRes?.totalCount || 0;

  // 3. Calculate total pages
  const totalPages = useMemo(
    () => Math.ceil(coursesCount / pageSize),
    [coursesCount],
  );

  // Helper to reset page when category changes
  const handleCategoryChange = (category: CategoryDto | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  return (
    <div className={cn(" bg-surface-300 blur-in ")}>
      <Separator />

      <CoursesHeader
        onCategoryChange={handleCategoryChange}
        onViewChange={setSelectedView}
        selectedCategory={selectedCategory}
        selectedView={selectedView}
      />

      <LoadingContainer isLoading={isFetching} minHeight="min-h-screen">
        <div className={cn(" container mx-auto p-[48px_8px] lg:p-[48px_0px] ")}>
          {selectedView === "Grid" && (
            <div
              className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[16px] gap-y-[32px]",
              )}
            >
              {courses?.map((course) => (
                <CoursesGridCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {selectedView === "List" && (
            <div
              className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-x-[16px] gap-y-[32px]",
              )}
            >
              {courses?.map((course) => (
                <CoursesListCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* 4. Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-16">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isFetching}
                className="p-2 rounded-md border border-border/40 hover:bg-surface-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Page Numbers & Ellipsis Dots */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Logic to show ellipsis dots (...) if there are many pages
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
                aria-label="Next page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </LoadingContainer>
    </div>
  );
}
