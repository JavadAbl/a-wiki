import { cn } from "#lib/utils";
import { GridIcon, ListIcon } from "lucide-react";
import { useCategoryGetManyQuery } from "../../../../features/course/course-api";
import { DragScrollContainer } from "#components/utils/drag-scroll-container";
import { Button } from "#components/ui/button";
import type { CategoryDto } from "../../../../features/course/dto/category.dto";

interface Props {
  selectedCategory: CategoryDto | null;
  onCategoryChange: (category: CategoryDto | null) => void;
  selectedView: "Grid" | "List";
  onViewChange: (view: "Grid" | "List") => void;
}

export default function CoursesHeader({
  onCategoryChange,
  selectedCategory,
  onViewChange,
  selectedView,
}: Props) {
  const { data: categoriesRes } = useCategoryGetManyQuery();
  const categories = categoriesRes?.items;

  return (
    <div
      className={cn(
        "flex justify-between items-center p-[10px] bg-surface-200 shadow-lg",
      )}
    >
      {!!categories?.length && (
        <DragScrollContainer
          className="self-stretch flex-1"
          classNameItem="flex gap-4 h-full"
        >
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={
                selectedCategory?.name === cat.name
                  ? "primaryGradient"
                  : "secondary"
              }
              className={cn(
                "whitespace-nowrap max-w-[160px] h-auto font-normal font-b2",
              )}
              onClick={() => {
                if (selectedCategory?.name === cat.name) onCategoryChange(null);
                else onCategoryChange(cat);
              }}
            >
              {cat.name}
            </Button>
          ))}
        </DragScrollContainer>
      )}

      <div
        className={cn(
          "flex items-center gap-[8px] p-[4px] bg-surface-300 rounded-[12px] shrink-0 mr-4",
        )}
      >
        <div
          className={cn(
            "p-[6px] rounded-[8px] cursor-pointer",
            selectedView === "Grid" && "text-primary-500 bg-surface-100",
          )}
        >
          <GridIcon size={20} onClick={() => onViewChange("Grid")} />
        </div>

        <div
          className={cn(
            "p-[6px] rounded-[8px] cursor-pointer",
            selectedView === "List" && "text-primary-500 bg-surface-100",
          )}
        >
          <ListIcon size={20} onClick={() => onViewChange("List")} />
        </div>
      </div>
    </div>
  );
}
