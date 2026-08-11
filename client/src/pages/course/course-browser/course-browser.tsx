import { cn } from "#lib/utils";
import { useCourseGetByIdQuery } from "../../../features/course/course-api";
import { useParams } from "react-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { BookOpen } from "lucide-react";
import CourseBrowserSectionList from "./components/course-browser-section-list";
import CourseBrowserDocuments from "./components/course-browser-documents.tsx";
import CourseBrowserPlayer from "./components/course-browser-player.tsx";
import CourseBrowserParts from "./components/course-browser-parts.tsx";
import { useAppDispatch } from "#hooks/redux-hooks";
import { courseActions } from "../../../features/course/course-slice.ts";
import { useEffect, useLayoutEffect } from "react";

export default function CourseBrowser() {
  const params = useParams();
  const dis = useAppDispatch();
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
        if (course?.sections.length) {
          dis(
            courseActions.setCourseBrowserSelectedSection({
              section: course.sections[0],
            }),
          );

          dis(
            courseActions.setCourseBrowserSelectedContent({
              content: course.sections[0]?.parts?.[0]?.contents[0],
            }),
          );
        }
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
        {/* Top row – Player + Section List */}
        <div
          className={cn(
            "flex flex-col lg:flex-row gap-4 md:gap-[16px]",
            // Use flex-[2] on desktop to make this row taller than the bottom row
            "lg:flex-[2] min-h-0",
          )}
        >
          {/* Player – full width on mobile, grows on desktop */}
          <div className={cn("w-full lg:flex-1")}>
            <div
              // Replaces your current height classes
              className="w-full aspect-video h-auto"
              // className="w-full aspect-video max-h-[280px] sm:max-h-[350px] md:max-h-[420px] lg:max-h-[800px]"
            >
              <CourseBrowserPlayer />
            </div>
          </div>

          {/* Section List – full width on mobile, fixed 300px on desktop */}
          <div className={cn("w-full lg:w-[300px] lg:flex-shrink-0")}>
            <CourseBrowserSectionList course={course} />
          </div>
        </div>

        {/* Bottom row – Parts + Documents */}
        <div
          className={cn(
            "flex flex-col lg:flex-row gap-4 md:gap-[16px]",
            "lg:flex-1 min-h-0",
          )}
        >
          {/* Parts – full width on mobile, grows on desktop */}
          <div className={cn("w-full lg:flex-1")}>
            <CourseBrowserParts />
          </div>

          {/* Documents – full width on mobile, fixed 300px on desktop */}
          <div className={cn("w-full lg:w-[300px] lg:flex-shrink-0")}>
            {!!course?.documents?.length && (
              <CourseBrowserDocuments course={course} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
