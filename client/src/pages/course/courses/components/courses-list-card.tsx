import { cn } from "#lib/utils";
import { ChevronLeftIcon } from "lucide-react";
import type { CourseDto } from "../../../../features/course/dto/course.dto";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { useNavigate } from "react-router";
import { sharedActions } from "../../../../features/shared/shared-slice";

interface Props {
  course: CourseDto;
}
export default function CoursesListCard({ course }: Props) {
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const dis = useAppDispatch();
  const nav = useNavigate();

  return (
    <div
      className={cn(
        "flex gap-[12px] bg-background rounded-[24px] px-[16px] pt-[16px] pb-[18px]",
      )}
    >
      <div className={cn("flex-1")}>
        <img
          className={cn("h-full object-cover rounded-[32px] ")}
          src={course.thumbnailUrl ?? "/images/course-cover.webp"}
          alt={course.title}
        />
      </div>

      <div className={cn("flex flex-col flex-3 gap-[16px]")}>
        <div className={cn("flex flex-col gap-[6px] ")}>
          <span className={cn("font-medium leading-[27px] text-foreground")}>
            {course.title}
          </span>

          <span className={cn("font-h6 text-[#555555]")}>
            {course.description}
          </span>

          <span className={cn("font-b2 text-[#555555]")}>
            {course.lecturer}
          </span>

          <span className={cn("font-b2 text-[#777777]")}>
            {`تعداد محتوا: ${course.totalContents} قسمت - ${course.totalContentsLength} ساعت`}
          </span>
        </div>

        <div
          className={cn(
            "flex justify-between border-t border-neutral-100 pt-[8px] ml-[16px]",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-[8px] py-[6px] px-[12px] bg-[#F9FAFB] border border-[#E5E7EB] text-[#4A5565] rounded-[32px]",
            )}
          >
            <span className={cn("font-bold text-[14px] leading-[20px]")}>
              {"حفاظت شده"}
            </span>

            <LockIcon />
          </div>

          <div className={cn("flex items-center text-primary-300 ")}>
            <ChevronLeftIcon />
            <span
              className={cn("font-[16px] font-medium cursor-pointer")}
              onClick={() => {
                if (isAuth) nav(`/Courses/${course.id}`);
                else
                  dis(
                    sharedActions.setIsOpenLogin({
                      isOpen: true,
                      redirect: `/Courses/${course.id}`,
                    }),
                  );
              }}
            >
              {"مشاهده آموزش"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M1.6 5.6V4C1.6 2.93913 2.02143 1.92172 2.77157 1.17157C3.52172 0.421427 4.53913 0 5.6 0C6.66087 0 7.67828 0.421427 8.42843 1.17157C9.17857 1.92172 9.6 2.93913 9.6 4V5.6C10.0243 5.6 10.4313 5.76857 10.7314 6.06863C11.0314 6.36869 11.2 6.77565 11.2 7.2V11.2C11.2 11.6243 11.0314 12.0313 10.7314 12.3314C10.4313 12.6314 10.0243 12.8 9.6 12.8H1.6C1.17565 12.8 0.768687 12.6314 0.468629 12.3314C0.168571 12.0313 0 11.6243 0 11.2V7.2C0 6.77565 0.168571 6.36869 0.468629 6.06863C0.768687 5.76857 1.17565 5.6 1.6 5.6ZM8 4V5.6H3.2V4C3.2 3.36348 3.45286 2.75303 3.90294 2.30294C4.35303 1.85286 4.96348 1.6 5.6 1.6C6.23652 1.6 6.84697 1.85286 7.29706 2.30294C7.74714 2.75303 8 3.36348 8 4Z"
        fill="#4A5565"
      />
    </svg>
  );
}
