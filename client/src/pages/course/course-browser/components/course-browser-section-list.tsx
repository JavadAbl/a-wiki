import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { cn } from "#lib/utils";
import { courseActions } from "../../../../features/course/course-slice";
import type { CourseDetailsDto } from "../../../../features/course/dto/course.details.dto";
import { formatSeconds } from "../../../../utils/app-utils";
import CourseBrowserSectionListItem from "./course-browser-section-list-item";
import { Clock, ListVideo } from "lucide-react";

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
        "flex h-full flex-col bg-surface-100 border border-neutral-100 p-6 rounded-3xl gap-6 overflow-auto scrollbar-thin",
      )}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2">
          <ListVideo className="size-5 text-primary-500" />
          <span className="text-content-primary font-h6">سر فصل های دوره</span>
        </div>

        <div className="flex items-center gap-1.5 text-content-tertiary text-sm bg-neutral-50 px-2.5 py-1 rounded-full">
          <Clock className="size-3.5" />
          <span>{formatSeconds(selectedSection?.totalContentsLength)}</span>
        </div>
      </div>

      {/* List Section */}
      <div className="flex flex-col gap-4">
        {course.sections.length > 0 ? (
          course.sections.map((section, index) => (
            <CourseBrowserSectionListItem
              key={`Sections_${section.id}_${index}`}
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
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-content-tertiary">
            <ListVideo className="size-10 mb-2 opacity-50" />
            <span className="text-sm">
              هیچ فصلی برای این دوره ثبت نشده است.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
