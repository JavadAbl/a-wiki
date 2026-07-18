import { cn } from "#lib/utils";
import type { ContentDto } from "../../../../features/course/dto/content.dto";

interface Props {
  content: ContentDto | null;
}

export default function CourseBrowserPlayer({ content }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-primary-500 p-[16px_12px] rounded-[20px] gap-[16px] text-content-secondary h-full",
      )}
    >
      player
    </div>
  );
}
