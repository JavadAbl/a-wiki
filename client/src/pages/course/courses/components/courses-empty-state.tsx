// components/courses-empty-state.tsx
import { FolderOpen } from "lucide-react";
import type { CategoryDto } from "../../../../features/course/dto/category.dto";

interface CoursesEmptyStateProps {
  search?: string | null;
  category?: CategoryDto | null;
  onClearFilters: () => void;
}

export function CoursesEmptyState({
  search,
  category,
  onClearFilters,
}: CoursesEmptyStateProps) {
  const hasFilters = search || category;

  // Determine the appropriate Persian message
  const getMessage = () => {
    if (search) {
      return `هیچ دوره‌ای برای جستجوی "${search}" یافت نشد`;
    }
    if (category) {
      return `هیچ دوره‌ای در دسته‌بندی "${category.name}" موجود نیست`;
    }
    return "در حال حاضر هیچ دوره‌ای موجود نیست";
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FolderOpen className="h-20 w-20 text-muted-foreground/50 mb-6" />
      <h3 className="text-2xl font-semibold text-foreground mb-2">
        دوره‌ای یافت نشد
      </h3>
      <p className="text-muted-foreground max-w-md">{getMessage()}</p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="mt-6 px-4 py-2 text-sm font-medium text-primary-400 hover:text-primary-500 transition-colors"
        >
          حذف فیلترها
        </button>
      )}
    </div>
  );
}
