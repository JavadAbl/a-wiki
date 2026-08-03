import { Separator } from "#components/ui/separator";
import { cn } from "#lib/utils";
import { ArrowUpNarrowWideIcon, EyeIcon, RadarIcon } from "lucide-react";

export default function About() {
  return (
    <div className={cn("flex flex-col gap-[32px] items-stretch")}>
      <div className={cn("flex gap-[32px] py-[16px] max-w-[1100px]  mx-auto")}>
        <div className={cn("flex flex-col  gap-[32p]")}>
          <span className={cn("text-primary font-bold text-[48px]")}>
            {"با امید به آتیه می اندیشیم"}
          </span>

          <div
            className={cn("flex gap-[32px] text-[16px] text-content-tertiary ")}
          >
            <span className={cn("bg-[#FF8343] w-[32px]")}></span>
            <span>
              {
                "شرکت آتیه سازان امید نسل امروز در تاریخ 1394/01/24 با هدف برون سپاری فرایندهای پشتیبانی و خدماتی شرکت بیمه دی در راستای چابک سازی ستاد مرکزی و تمرکز مدیران به موضوع اصلی فعالیت آن شرکت یعنی بیمه گری و همچنین تشکیل یک شرکت سهامی با سرمایه کارکنان با رویکرد اقتصادی و ایجاد پشتوانه برای سهامداران در راستای نگهداشت سرمایه انسانی، تاسیس شده است."
              }
            </span>
          </div>
        </div>

        <img src="/images/about.webp" alt="atie" className={cn("h-[300px]")} />
      </div>

      <Separator />

      <div className={cn(" gap-[32px] py-[60px] bg-[#B2DEE3]  ")}>
        <div className={cn("flex flex-col gap-[16px] max-w-[900px] mx-auto")}>
          <span className={cn("font-bold text-lg")}>{"ارکان جهت ساز"}</span>

          <div className={cn("grid grid-cols-3 gap-[16px]")}>
            <ArkanItem
              text={
                "کسب سود حداکثری در بازارهای کشور از طریق ایجاد و توسعه فرصت های کسب و کار"
              }
              icon={<EyeIcon />}
              iconText={"چشم انداز‌ها"}
            />
            <ArkanItem
              text={
                "شناسایی فرصت‌های جدید سرمایه‌گذاری و ورود به بازار برای ایجاد ارزش متمایز برای ذی‌نفعان، با رویکرد برد–برد و رشد پایدار جامعه."
              }
              icon={<RadarIcon />}
              iconText={"ماموریت"}
            />
            <ArkanItem
              text={"همدلی چابکی حرفه ای گری تعهد به تعالی فردی و سازمانی"}
              icon={<ArrowUpNarrowWideIcon />}
              iconText={"ارزش ها"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const ArkanItem = ({ text, icon, iconText }) => (
  <div
    className={cn("flex p-[16px_32px] gap-[8px] bg-[#80C7D0] rounded-[8px]")}
  >
    <div
      className={cn(
        "flex flex-col gap-[4px] bg-surface-100 p-[16px_8px] rounded-[8px] justify-center items-center text-sm w-[140px]",
      )}
    >
      {icon}
      <span> {iconText}</span>
    </div>

    <span className={cn("text-content-tertiary text-sm")}>{text}</span>
  </div>
);
