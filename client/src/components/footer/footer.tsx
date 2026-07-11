import AtieLogoFooter from "#components/icons/atie-logo-footer";
import { Button } from "#components/ui/button";
import { Card, CardContent } from "#components/ui/card";
import { ImageIcon } from "lucide-react";
import type { JSX } from "react/jsx-runtime";

const socialLinks = [
  { name: "Facebook", icon: ImageIcon, href: "#" },
  { name: "Instagram", icon: ImageIcon, href: "#" },
  { name: "Twitter", icon: ImageIcon, href: "#" },
  { name: "LinkedIn", icon: ImageIcon, href: "#" },
];

const phoneNumbers = [
  { label: "تلفن :", value: "22023032-021", href: "tel:02122023032" },
  { label: "تلفن :", value: "22023032-021", href: "tel:02122023032" },
];

const companyDescription =
  "شرکت آتیه سازان امید نسل امروز با هدف برون سپاری فرایندهای پشتیبانی و خدماتی شرکت بیمه دی در راستای چابک سازی ستاد مرکزی و همچنین تشکیل یک شرکت سهامی با سرمایه کارکنان با رویکرد اقتصادی تاسیس شده است.";

const address = "آدرس : جردن خیابان سلطانی تقاطع مهرداد پلاک 32 زنگ 9";

const workingHours = "ساعت کاری : 8 صبح الی 16";

const copyright = "© 2026 - طراحی شده در آتیه سازان امید نسل امروز";

const sectionTitleClassName =
  "text-[22px] leading-[33px] tracking-[1.76px] font-bold text-[#ebebeb] [font-family:'Fira_Sans-Bold',Helvetica] [direction:rtl]";

const bodyTextClassName = "text-xl leading-[34px] font-normal text-[#ebebeb]";

const Footer = (): JSX.Element => {
  return (
    <footer className="w-full bg-[#222222] text-[#ebebeb]" dir="rtl">
      <div className="mx-auto max-w-[1180px] px-6 py-12 md:px-10 md:py-16 lg:px-16 lg:py-20">
        <div className="flex justify-between md:gap-10">
          <Card className="border-0 bg-transparent shadow-none flex-2">
            <CardContent className="flex flex-col items-start p-0 text-right">
              <AtieLogoFooter className="" />

              <p className={`${bodyTextClassName}  text-right`}>
                {companyDescription}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-transparent shadow-none flex-1">
            <CardContent className="flex flex-col items-start p-0 text-right">
              <h2 className={sectionTitleClassName}>ارتباط با ما</h2>
              <div className="mt-6 flex flex-col items-start gap-5">
                <div className="flex flex-col items-start gap-1.5">
                  {phoneNumbers.map((phone, index) => (
                    <p
                      key={`phone-${index}`}
                      className={`${bodyTextClassName} whitespace-nowrap`}
                    >
                      <span>{phone.label}</span>
                      <a
                        href={phone.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        {" "}
                        {phone.value}
                      </a>
                    </p>
                  ))}
                </div>

                <p className={`${bodyTextClassName} max-w-[260px] text-right`}>
                  {address}
                </p>

                <p
                  className={`${bodyTextClassName} whitespace-nowrap text-right`}
                >
                  {workingHours}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-transparent shadow-none flex-1">
            <CardContent className="flex flex-col items-end p-0 text-right">
              <h2 className={sectionTitleClassName}>شبکه‌های اجتماعی</h2>
              <nav
                aria-label="شبکه‌های اجتماعی"
                className="mt-6 flex flex-row-reverse items-center gap-3"
              >
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Button
                      key={item.name}
                      variant="secondary"
                      size="icon"
                      className="h-auto rounded-full border-0 bg-[#ebebeb] p-0 text-[#222222] hover:bg-[#d9d9d9] w-8 h-8 min-w-8"
                    >
                      <a href={item.href} aria-label={item.name}>
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </a>
                    </Button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 border-t border-white/70 pt-6 md:mt-12 md:pt-7">
          <p className={`font-normal text-[#ebebeb] text-center`}>
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
