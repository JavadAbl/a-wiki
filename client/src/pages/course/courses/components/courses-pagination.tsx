// ./components/courses-pagination.tsx
import { Button } from "#components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "#lib/utils";

interface CoursesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function CoursesPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: CoursesPaginationProps) {
  if (totalPages <= 1) return null;

  // Generate dot indicators (limit to max 7 dots for scalability)
  const getVisiblePages = () => {
    const maxDots = 7;
    if (totalPages <= maxDots)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    let start = Math.max(1, currentPage - Math.floor(maxDots / 2));
    let end = start + maxDots - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxDots + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="flex items-center gap-4" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all",
              currentPage === page
                ? "bg-primary scale-125"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
            )}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
