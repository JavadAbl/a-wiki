import { cn } from "#lib/utils";
import { ChevronLeftIcon } from "lucide-react";
import type { SectionDto } from "../../../../features/course/dto/section.dto";
import { secondToMinute } from "../../../../utils/app-utils";

interface Props {
  section: SectionDto;
  index: number;
  isSelected: boolean;
  onClick: () => any;
}

export default function CourseBrowserSectionListItem({
  section,
  index,
  isSelected,
  onClick,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center border p-[20px_12px] rounded-[12px] gap-[16px]",
        !isSelected && "bg-transparent border-neutral-100 ",
        isSelected && "bg-primary/25 border-primary-600",
      )}
      onClick={onClick}
    >
      {/* //Index Circle ---------------------------------------------------- */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full size-[40px] font-h6",
          !isSelected && "bg-neutral-100 text-content-tertiary",
          isSelected && "bg-primary-500 text-content-secondary",
        )}
      >
        <span className={cn("font-h5")}>{index}</span>
      </div>

      {/* //Titles ---------------------------------------------------- */}
      <div className={cn("flex flex-col gap-[8px] flex-1")}>
        <span className={cn("text-primary-500 font-h6")}>{section.title}</span>
        <span
          className={cn("text-primary-400 font-h7")}
        >{`${secondToMinute(section.totalContentsLength)} دقیقه`}</span>
      </div>

      <ChevronLeftIcon className={cn("text-primary-500 size-[20px]")} />
    </div>
  );
}
