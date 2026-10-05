import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#components/ui/card";
import { Button } from "#components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import {
  useHeroImageURLQuery,
} from "../../../features/shared/shared-api";
import { toAbsoluteAssetUrl } from "../../../features/base-api";
import HeroImageUpdate from "./components/hero-image-update";

export default function AdminPanelSettings() {
  const [isOpenHeroUpdate, setIsOpenHeroUpdate] = useState(false);

  const { data: heroImageData } = useHeroImageURLQuery();

  const heroUrl = toAbsoluteAssetUrl(heroImageData?.url) ?? "/images/hero.webp";

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-bold text-lg">تنظیمات</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon size={18} />
            تصویر پس‌زمینه صفحه اصلی
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <div className="w-full max-w-200 aspect-video overflow-hidden rounded-xl border border-border bg-gray-100">
            <img
              src={heroUrl}
              alt="تصویر پس‌زمینه صفحه اصلی"
              className="h-full w-full object-cover"
            />
          </div>

          <Button
            variant={"primary"}
            className="rounded-[24px]"
            onClick={() => setIsOpenHeroUpdate(true)}
          >
            تغییر تصویر
          </Button>
        </CardContent>
      </Card>

      <HeroImageUpdate isOpen={isOpenHeroUpdate} setIsOpen={setIsOpenHeroUpdate} />
    </div>
  );
}