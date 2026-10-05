import { cn } from "#lib/utils";
import { useCourseGetByIdQuery } from "../../../features/course/course-api";
import { useParams } from "react-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { BookOpen } from "lucide-react";
import CourseBrowserRelatedCourses from "./components/course-browser-related-courses";
import CourseBrowserDocuments from "./components/course-browser-documents.tsx";
import CourseBrowserPlayer from "./components/course-browser-player.tsx";
import CourseBrowserParts from "./components/course-browser-parts.tsx";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { courseActions } from "../../../features/course/course-slice.ts";
import { useEffect, useLayoutEffect } from "react";
import { Show } from "#components/utils/show";

export default function CourseBrowser() {
  const params = useParams();
  const dis = useAppDispatch();
  const selectedContent = useAppSelector(
    (s) => s.course.courseBrowserSelectedContent,
  );
  const courseId = params?.id;

  //Data Hooks
  const { data: course, isLoading } = useCourseGetByIdQuery(
    courseId ? courseId : skipToken,
  );

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (course) {
      const run = () => {
        document.title = course.title;
        dis(courseActions.setCourseBrowserSelectedCourse({ course }));
      };
      run();
    }

    return () => {
      document.title = "ویکی آتیه";
      dis(courseActions.setCourseBrowserSelectedCourse({ course: null }));
      dis(courseActions.setCourseBrowserSelectedSection({ section: null }));
      dis(courseActions.setCourseBrowserSelectedPart({ part: null }));
      dis(courseActions.setCourseBrowserSelectedContent({ content: null }));
    };
  }, [course, dis]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] ">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <BookOpen className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">در حال بارگذاری دوره</p>
            <p className="text-xs text-muted-foreground mt-1">
              لطفاً چند لحظه صبر کنید...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className={cn("bg-surface-300 p-4 md:p-[16px] mask-reveal-l")}>
      <div
        className={cn("container mx-auto flex flex-col gap-4 md:gap-[16px]")}
      >
        {/* Top row – Vertical Slider + Section List */}
        <div
          className={cn(
            "flex flex-col lg:flex-row gap-4 md:gap-[16px]",
            "lg:flex-[2] min-h-0",
          )}
        >
          <div className={cn("w-full lg:flex-1")}>
            {/* Vertical Slider Container */}
            <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-muted/20">
              {/* Player - Slides DOWN from above */}
              <div
                className={cn(
                  "absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform",
                  selectedContent ? "translate-y-0" : "-translate-y-full",
                )}
              >
                <CourseBrowserPlayer />
              </div>

              {/* Parts (Top Version) - Slides DOWN out of view */}
              <div
                className={cn(
                  "absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform overflow-y-auto",
                  selectedContent ? "translate-y-full" : "translate-y-0",
                )}
              >
                <CourseBrowserParts />
              </div>
            </div>
          </div>

          <div className={cn("w-full lg:w-[300px] lg:flex-shrink-0")}>
            <CourseBrowserRelatedCourses />
          </div>
        </div>

        {/* Bottom row – Slide-down Parts + Documents */}
        <div
          className={cn(
            "flex flex-col lg:flex-row gap-4 md:gap-[16px]",
            "lg:flex-1 min-h-0",
          )}
        >
          <div className={cn("w-full lg:flex-1")}>
            <div
              className={cn(
                "grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                selectedContent
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <CourseBrowserParts />
              </div>
            </div>
          </div>

          <div className={cn("w-full lg:w-[300px] lg:flex-shrink-0")}>
            <Show when={!!course?.documents?.length}>
              <CourseBrowserDocuments course={course} />
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
