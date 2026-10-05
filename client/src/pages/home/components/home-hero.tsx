import { Button } from "#components/ui/button";
import { CardContent } from "#components/ui/card";
import { cn } from "#lib/utils";
import { useNavigate } from "react-router";
import {
  useDashboardHeroDataQuery,
  useHeroImageURLQuery,
} from "../../../features/shared/shared-api";
import { toAbsoluteAssetUrl } from "../../../features/base-api";

export default function HomeHero() {
  const nav = useNavigate();

  const { data } = useDashboardHeroDataQuery();
  const { data: heroImageData } = useHeroImageURLQuery();

  if (!data) return null;

  const heroUrl = toAbsoluteAssetUrl(heroImageData?.url) ?? "/images/hero.webp";
  const isDefaultHero = !heroImageData?.url;

  const stats = [
    { value: 1000, label: "کاربر فعال" },
    { value: (data.courseDuration / 60 / 60).toFixed(), label: "ساعت ویدیو" },
    { value: data.courseCount, label: "دوره آموزشی" },
  ];

  const actions = [
    {
      label: "مشاهده دوره‌ها",
      variant: "primary",
      onClick: () => nav("/Courses"),
    },
    /*  {
      label: "مشاهده دوره‌ها",
      variant: "glass",
      onClick: () => nav("/Courses"),
    }, */
  ] as const;

  return (
    <section
      className="relative min-h-180 w-full overflow-hidden bg-center bg-cover"
      style={{
        backgroundImage: isDefaultHero
          ? `linear-gradient(270deg, rgba(11,79,74,0.6) 16.81%, rgba(15,23,43,0.9) 73.25%), url('${heroUrl}')`
          : `url('${heroUrl}')`,
      }}
    >
      {/*    <div aria-hidden="true" className="absolute inset-0 " />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-l from-[rgba(11,79,74,0.6)] via-[rgba(11,79,74,0.6)] to-[rgba(15,23,43,0.9)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/images/hero.png')] bg-center bg-cover opacity-35 mix-blend-screen"
      /> */}

      <div className="relative mx-auto flex min-h-180 w-full max-w-360 items-center justify-start px-6 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-130 border-0! outline-0! bg-transparent shadow-none">
          <CardContent className="flex flex-col items-start gap-9 p-0 text-start">
            <header className="flex w-full flex-col items-start gap-3">
              <p className="-mt-px w-fit overflow-hidden text-ellipsis font-slogan text-surface-100 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
                ویکی آتیه
              </p>

              <h1 className="w-fit overflow-hidden text-ellipsis font-h1 text-surface-100 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
                منبع آموزشی آتیه سازان امید نسل امروز
              </h1>

              <p className="flex w-fit items-center justify-start font-h2 text-primary-100">
                مهارت های تخصصی خود را افزایش دهید
              </p>
            </header>
            <nav
              aria-label="اقدامات اصلی"
              className="flex w-full items-center justify-start gap-3"
            >
              {actions.map((action) => (
                <Button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={cn(
                    "cursor-pointer px-6 py-4  font-b1",
                    action.variant === "primary"
                      ? "h-auto rounded-2xl bg-primary-300 text-content-secondary  hover:bg-primary-100/50 "
                      : "h-auto rounded-xl border border-solid border-border bg-bgcolor  text-content-secondary backdrop-blur-sm hover:bg-white/15 ",
                  )}
                >
                  {action.label}
                </Button>
              ))}
            </nav>

            <section className="flex w-full items-start justify-start gap-8 border-t border-bgcolor-hover px-0 py-6 sm:gap-12 lg:gap-18">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="inline-flex flex-col items-start gap-3"
                >
                  <p className="-mt-px flex items-center justify-start self-stretch font-h0 text-white">
                    {stat.value}+
                  </p>

                  <p className="flex items-center justify-start self-stretch font-p2 text-content-secondary">
                    {stat.label}
                  </p>
                </article>
              ))}
            </section>
          </CardContent>
        </div>
      </div>
    </section>
  );
}
