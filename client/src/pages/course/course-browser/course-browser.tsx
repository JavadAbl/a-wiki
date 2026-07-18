import { cn } from "#lib/utils";
import { useCourseGetByIdQuery } from "../../../features/course/course-api";
import { useParams, useSearchParams } from "react-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { BookOpen } from "lucide-react";
import CourseBrowserSectionList from "./components/course-browser-section-list";
import CourseBrowserDocuments from "./components/course-browser-documents.tsx";
import CourseBrowserPlayer from "./components/course-browser-player.tsx";
import { useAppSelector } from "#hooks/redux-hooks";
import CourseBrowserParts from "./components/course-browser-parts.tsx";

export default function CourseBrowser() {
  const selectedContent = useAppSelector(
    (s) => s.course.courseBrowserSelectedContent,
  );
  const params = useParams();
  const courseId = params?.id;

  /*  useEffect(() => {
    const run = () => {
        if(selectedContentId)
        {
            const selectedContent = cour
        }
    };
    run();
  }, [selectedContentId]); */

  //Data Hooks
  const { data: course, isLoading } = useCourseGetByIdQuery(
    courseId ? courseId : skipToken,
  );

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
  console.log(courseId);
  console.log(course);
  if (!course) return null;

  return (
    <div className={cn(" bg-surface-300   p-[16px]")}>
      <div className={cn(" container mx-auto space-y-[16px]")}>
        <div className={cn("flex  gap-[16px] flex-2 h-[500px] ")}>
          <div className={cn("grow shrink h-full")}>
            <CourseBrowserPlayer content={selectedContent} />
          </div>

          <div className={cn("w-[300px] h-full")}>
            <CourseBrowserSectionList course={course} />
          </div>
        </div>

        <div className={cn("flex  gap-[16px] flex-1 h-full")}>
          <div className={cn("grow shrink")}>
            <CourseBrowserParts />
          </div>

          <div className={cn("w-[300px]")}>
            {!!course?.documents?.length && (
              <CourseBrowserDocuments course={course} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
