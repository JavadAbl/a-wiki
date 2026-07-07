import { Card, CardContent } from "#components/ui/card";
import type { JSX } from "react/jsx-runtime";

const features = [
  {
    title: "محتوای آموزشی غنی",
    description: ["دسترسی به بهترین محتوا", "با جدیدترین استانداردها"],
    Icon: MemberIcon,
  },
  {
    title: "یادگیری مؤثر",
    description: ["یادگیری ساده، پیشرفت واقعی", "همراه با محتوایی حرفه‌ای"],
    Icon: ChartIcon,
  },
  {
    title: "مدرس های مجرب",
    description: ["آموزش از اساتید برتر و با تجربه", "در این صنعت"],
    Icon: BookIcon,
  },
];

const glowBlobs = [
  "left-[5%] top-[6%] h-56 w-56",
  "right-[6%] top-[4%] h-72 w-72",
  "right-[2%] top-[68%] h-56 w-56",
];

const HeroFeatures = (): JSX.Element => {
  return (
    <section
      className="relative overflow-hidden bg-[#f8f8f8] px-6 py-[72px] md:px-10"
      dir="rtl"
    >
      {glowBlobs.map((blobClassName, index) => (
        <div
          key={`glow-${index}`}
          aria-hidden="true"
          className={`pointer-events-none absolute rounded-full bg-[#00bba71a] blur-3xl ${blobClassName}`}
        />
      ))}

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-9">
        <div className="inline-flex items-center justify-center rounded-3xl bg-primary-100 px-5.75 py-2.75">
          <span className="font-b2  text-primary-600">چرا ویکی آتیه؟</span>
        </div>

        <header className="flex flex-col items-center gap-4 text-center">
          <h2 className=" text-[#101828] font-h0">مزایای یادگیری با ما</h2>

          <p className="max-w-lg font-p2  text-content-tertiary">
            با ویکی آتیه، تجربه یادگیری حرفه‌ای و کامل را تجربه کنید
          </p>
        </header>

        <div className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[102px]">
          {features.map((feature) => {
            const Icon = feature.Icon;

            return (
              <Card
                key={feature.title}
                className="w-full max-w-120 rounded-2xl border border-solid border-neutral-100 bg-white shadow-[0px_10px_15px_-3px_#0000001a,0px_4px_6px_-4px_#0000001a]"
              >
                <CardContent className="flex flex-col items-center gap-3 p-9">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[linear-gradient(317deg,rgba(0,213,190,1)_16%,rgba(0,211,242,1)_80%)] shadow-[0px_10px_15px_-3px_#00bba74c,0px_4px_6px_-4px_#00bba74c]">
                    <Icon className="h-14 w-14 text-white" strokeWidth={1.6} />
                  </div>
                  <h3 className="text-center font-h3 text-content-primary ">
                    {feature.title}
                  </h3>
                  <div className="flex w-full justify-center border-t border-neutral-100 pt-2">
                    <p className="text-center font-b1 leading-[1.8] text-content-tertiary ">
                      {feature.description.map((line, index) => (
                        <span
                          key={`${feature.title}-line-${index}`}
                          className="block"
                        >
                          {line}
                        </span>
                      ))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroFeatures;
interface IconProps {
  className?: string;
  strokeWidth?: number;
}

function MemberIcon({ className = "", strokeWidth = 2 }: IconProps) {
  return (
    <svg
      className={className}
      width="49"
      height="44"
      viewBox="0 0 49 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M38.3333 43C38.3333 38.0493 36.3667 33.3014 32.866 29.8007C29.3653 26.3 24.6174 24.3333 19.6667 24.3333M19.6667 24.3333C14.716 24.3333 9.96802 26.3 6.46734 29.8007C2.96666 33.3014 1 38.0493 1 43M19.6667 24.3333C26.11 24.3333 31.3333 19.11 31.3333 12.6667C31.3333 6.22334 26.11 1 19.6667 1C13.2233 1 8 6.22334 8 12.6667C8 19.11 13.2233 24.3333 19.6667 24.3333ZM47.6668 40.6671C47.6668 32.8038 43.0001 25.5005 38.3334 22.0005C39.8674 20.8496 41.094 19.3383 41.9048 17.6004C42.7155 15.8625 43.0853 13.9515 42.9815 12.0367C42.8777 10.1218 42.3034 8.26199 41.3096 6.62192C40.3157 4.98185 38.9329 3.61207 37.2834 2.63379"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon({ className = "", strokeWidth = 2 }: IconProps) {
  return (
    <svg
      className={className}
      width="49"
      height="44"
      viewBox="0 0 49 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24.3333 10.3333V43M24.3333 10.3333C24.3333 7.85798 23.35 5.48401 21.5997 3.73367C19.8493 1.98333 17.4754 1 15 1H3.33333C2.71449 1 2.121 1.24583 1.68342 1.68342C1.24583 2.121 1 2.71449 1 3.33333V33.6667C1 34.2855 1.24583 34.879 1.68342 35.3166C2.121 35.7542 2.71449 36 3.33333 36H17.3333C19.1898 36 20.9703 36.7375 22.2831 38.0503C23.5958 39.363 24.3333 41.1435 24.3333 43M24.3333 10.3333C24.3333 7.85798 25.3167 5.48401 27.067 3.73367C28.8173 1.98333 31.1913 1 33.6667 1H45.3333C45.9522 1 46.5457 1.24583 46.9833 1.68342C47.4208 2.121 47.6667 2.71449 47.6667 3.33333V33.6667C47.6667 34.2855 47.4208 34.879 46.9833 35.3166C46.5457 35.7542 45.9522 36 45.3333 36H31.3333C29.4768 36 27.6963 36.7375 26.3836 38.0503C25.0708 39.363 24.3333 41.1435 24.3333 43"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon({ className = "", strokeWidth = 2 }: IconProps) {
  return (
    <svg
      className={className}
      width="49"
      height="44"
      viewBox="0 0 49 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24.3333 31.3333V43M33.6667 26.6667V43M43 17.3333V43M47.6667 1L27.4927 21.174C27.3843 21.2826 27.2556 21.3688 27.1138 21.4277C26.9721 21.4865 26.8201 21.5168 26.6667 21.5168C26.5132 21.5168 26.3613 21.4865 26.2195 21.4277C26.0778 21.3688 25.949 21.2826 25.8407 21.174L18.1593 13.4927C17.9406 13.274 17.6439 13.1511 17.3345 13.1511C17.0251 13.1511 16.7285 13.274 16.5097 13.4927L1 29M5.66667 36V43M15 26.6667V43"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
