import { cn } from "#lib/utils";
import { useNavigate } from "react-router";
import HomeCourseCard from "./home-course-card";
import { useCoursesGetManyQuery } from "../../../features/course/course-api";

export default function HomeCourses() {
  const nav = useNavigate();

  const { data: coursesRes } = useCoursesGetManyQuery();
  const courses = coursesRes?.items;

  if (!courses) return null;

  return (
    <div className={cn("flex flex-col items-center gap-8 py-6 text-center")}>
      <div className={cn("flex flex-col")}>
        <span className={cn("font-h1 mb-1.5 text-[#101828]")}>
          {"دوره‌های پرطرفدار"}
        </span>

        <span className={cn("font-p1 text-[#4A5565]")}>
          {"بهترین دوره‌های آموزشی را کشف کنید"}
        </span>
      </div>

      <div className={cn("flex flex-wrap gap-14")}>
        {courses.map((course) => (
          <HomeCourseCard course={course} />
        ))}
      </div>

      <button
        className={cn(
          "bg-transparent border border-primary-500 text-primary-500 font-h3 px-8 py-3 rounded-[24px] cursor-pointer",
        )}
        onClick={() => nav("/Courses")}
      >
        {"مشاهده همه دوره ها"}
      </button>
    </div>
  );
}
