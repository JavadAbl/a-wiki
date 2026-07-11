import { Button } from "#components/ui/button";
import { Card, CardContent } from "#components/ui/card";
import type { JSX } from "react/jsx-runtime";

const courseData = {
  title: "ارزیابی اسناد خسارت درمان (بخش اول)",
  instructor: "مدرس دوره: دکتر احمد محمدی",
  role: "متخصص بیمه‌های درمانی",
  action: "ورود به دوره",
};

const HomeCourseCard = (): JSX.Element => {
  return (
    <article
      dir="rtl"
      className="  w-[300px] overflow-hidden rounded-[36px] bg-white shadow-[0_14px_35px_rgba(0,0,0,0.14)]"
    >
      <Card className="border-0 bg-transparent shadow-none rounded-none">
        <CardContent className="p-0">
          <img
            className="block h-auto  object-cover"
            alt="Header"
            src={"/images/course-cover.webp"}
          />

          <section className="flex flex-col items-center px-6 pb-8 pt-10 sm:px-10 sm:pb-10 sm:pt-12">
            <header className="flex w-full flex-col items-center text-center">
              <h1 className="font-h3 leading-normal text-primary-300 sm:text-[52px] sm:leading-[1.35]">
                {courseData.title}
              </h1>
              <div className="mt-6 flex flex-col items-center gap-2 text-content-tertiary">
                <p className="font-h5 leading-normal sm:text-[31px]">
                  {courseData.instructor}
                </p>
                <p className="font-h6 leading-normal sm:text-[28px]">
                  {courseData.role}
                </p>
              </div>
            </header>

            <Button
              type="button"
              className="h-auto mt-10 rounded-[16px] bg-primary-300 px-[56px] py-[12px] font-h3 text-content-secondary hover:bg-primary-400 cursor-pointer"
            >
              {courseData.action}
            </Button>
          </section>
        </CardContent>
      </Card>
    </article>
  );
};

export default HomeCourseCard;
