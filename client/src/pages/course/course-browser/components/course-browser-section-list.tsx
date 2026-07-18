import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { cn } from "#lib/utils";
import { courseActions } from "../../../../features/course/course-slice";
import type { CourseDetailsDto } from "../../../../features/course/dto/course.details.dto";
import CourseBrowserSectionListItem from "./course-browser-section-list-item";

interface Props {
  course: CourseDetailsDto;
}

export default function CourseBrowserSectionList({ course }: Props) {
  const dis = useAppDispatch();
  const selectedSection = useAppSelector(
    (s) => s.course.courseBrowserSelectedSection,
  );

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-surface-100  border border-neutral-100 p-[24px_16px] rounded-[24px] gap-[22px] overflow-auto",
      )}
    >
      <div className={cn("flex items-center gap-[8px] ")}>
        <span className={cn("text-content-primary font-h6")}>
          {"سر فصل های دوره"}
        </span>
      </div>

      <div className={cn("flex flex-col gap-[16px]")}>
        {course.sections.map((section, index) => (
          <CourseBrowserSectionListItem
            key={`Sections_${index}`}
            section={section}
            index={index + 1}
            isSelected={section.id === selectedSection?.id}
            onClick={() =>
              dis(
                courseActions.setCourseBrowserSelectedSection({
                  section: section,
                }),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
