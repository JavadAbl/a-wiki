import { cn } from "#lib/utils";
import { ChevronLeft, Clock } from "lucide-react";
import type { SectionDto } from "../../../../features/course/dto/section.dto";
import { secondToMinute } from "../../../../utils/app-utils";

interface Props {
  section: SectionDto;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function CourseBrowserSectionListItem({
  section,
  index,
  isSelected,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center border p-3 rounded-xl gap-4 transition-all duration-200 cursor-pointer group",
        !isSelected &&
          "bg-transparent border-neutral-100 hover:bg-neutral-50 hover:border-neutral-200",
        isSelected && "bg-primary-50 border-primary-600 shadow-sm",
      )}
    >
      {/* Index Circle */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full size-10 font-h6 transition-colors duration-200 shrink-0",
          !isSelected && "bg-neutral-100 text-content-tertiary",
          isSelected && "bg-primary-500 text-white",
        )}
      >
        <span className="font-h5">{index}</span>
      </div>

      {/* Titles & Duration */}
      <div className="flex flex-col gap-1 flex-1 text-right">
        <span
          className={cn(
            "font-h7 transition-colors duration-200",
            isSelected ? "text-primary-700" : "text-content-primary",
          )}
        >
          {section.title}
        </span>

        <div className="flex items-center gap-1.5 text-content-tertiary">
          <Clock className="size-3.5" />
          <span className="font-h7">
            {secondToMinute(section.totalContentsLength)} دقیقه
          </span>
        </div>
      </div>

      {/* Chevron Icon */}
      <ChevronLeft
        className={cn(
          "size-5 transition-all duration-200",
          isSelected
            ? "text-primary-600 translate-x-0 opacity-100"
            : "text-neutral-400 -translate-x-1 opacity-70 group-hover:translate-x-0 group-hover:opacity-100",
        )}
      />
    </button>
  );
}
