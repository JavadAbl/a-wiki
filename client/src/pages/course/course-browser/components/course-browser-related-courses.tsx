import { useNavigate } from "react-router";
import { Link2, Clock } from "lucide-react";
import { cn } from "#lib/utils";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { sharedActions } from "../../../../features/shared/shared-slice";
import type { CourseDto } from "../../../../features/course/dto/course.dto";
import { formatSeconds } from "../../../../utils/app-utils";

export default function CourseBrowserRelatedCourses() {
  const nav = useNavigate();
  const dis = useAppDispatch();
  const { isAuth } = useAppSelector((s) => s.auth);
  const selectedCourse = useAppSelector(
    (s) => s.course.courseBrowserSelectedCourse,
  );

  const relatedCourses: CourseDto[] = selectedCourse?.relatedCourses ?? [];

  const handleOpenCourse = (courseId: number) => {
    if (!isAuth) {
      dis(
        sharedActions.setIsOpenLogin({
          isOpen: true,
          redirect: `/Courses/${courseId}`,
        }),
      );
      return;
    }
    nav(`/Courses/${courseId}`);
  };

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-surface-100 border border-neutral-100 p-6 rounded-3xl gap-4 overflow-y-auto scrollbar-thin",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
        <Link2 className="size-5 text-primary-500" />
        <span className="text-content-primary font-h6">دوره‌های مرتبط</span>
      </div>

      {/* List */}
      {relatedCourses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {relatedCourses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => handleOpenCourse(course.id)}
              className={cn(
                "group flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-2 text-start",
                "transition-colors hover:border-primary-500/50 hover:bg-primary-500/5 cursor-pointer",
              )}
            >
              <img
                src={course.thumbnailUrl ?? "/images/course-cover.webp"}
                alt={course.title}
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
              />

              <div className="flex min-w-0 flex-col gap-1">
                <span className=" text-sm font-medium text-content-primary">
                  {course.title}
                </span>
                {course.lecturer && (
                  <span className="truncate text-xs text-content-tertiary">
                    {course.lecturer}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-content-tertiary">
                  <Clock className="size-3" />
                  {formatSeconds(course.totalContentsLength)}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center text-content-tertiary">
          <Link2 className="size-10 mb-2 opacity-50" />
          <span className="text-sm">
            دوره مرتبطی برای این دوره ثبت نشده است.
          </span>
        </div>
      )}
    </div>
  );
}
