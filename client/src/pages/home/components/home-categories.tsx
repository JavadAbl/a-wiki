import { useCategoryGetManyQuery } from "../../../features/course/course-api";
import { Link } from "react-router";
import type { CategoryDto } from "../../../features/course/dto/category.dto";
import { cn } from "#lib/utils";

export default function HomeCategories() {
  const { data: categoriesRes, isFetching } = useCategoryGetManyQuery();
  const categories = categoriesRes?.items || [];

  if (!categories?.length) return null;

  return (
    <div className="container mx-auto py-8 px-4 ">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-right border-r-2 rounded-[3px] border-primary pr-1">
        دسته‌بندی‌های منتخب
      </h2>

      <div className=" sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4 ">
        {isFetching
          ? // Loading Skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className=" flex flex-col items-center justify-center p-6 bg-surface-100 rounded-2xl shadow-sm animate-pulse"
              >
                <div className="w-16 h-16 bg-surface-200 rounded-2xl mb-3" />
                <div className="h-4 w-20 bg-surface-200 rounded" />
              </div>
            ))
          : categories.map((cat: CategoryDto) => (
              <Link
                key={cat.id}
                to={`/Courses?categoryId=${cat.id}`}
                className={cn(
                  " group flex flex-col items-center justify-center py-6 bg-surface-100 rounded-2xl shadow-md w-[200px] mx-auto mb-4 sm:mb-auto",
                  "hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer",
                )}
              >
                {/* Square Icon Container */}
                <div className=" mb-3 flex items-center justify-center overflow-hidden transition-colors">
                  <img
                    src={cat.icon || "/images/category.webp"}
                    alt={cat.name}
                    className="w-[64px] object-contain"
                  />
                </div>

                {/* Category Name */}
                <span className="text-sm font-medium text-foreground text-center line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
      </div>
    </div>
  );
}
