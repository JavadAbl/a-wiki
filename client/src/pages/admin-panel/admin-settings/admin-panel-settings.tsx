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
  useHeroImageDeleteMutation,
  useHeroImageURLQuery,
} from "../../../features/shared/shared-api";
import { toAbsoluteAssetUrl } from "../../../features/base-api";
import HeroImageUpdate from "./components/hero-image-update";
import { ConfirmModal } from "#components/modals/confirm-modal";
import { toast } from "sonner";

export default function AdminPanelSettings() {
  const [isOpenHeroUpdate, setIsOpenHeroUpdate] = useState(false);
  const [isOpenHeroDelete, setIsOpenHeroDelete] = useState(false);

  const { data: heroImageData } = useHeroImageURLQuery();
  const [mutateHeroImageDelete, { isLoading: isLoadingHeroDelete }] =
    useHeroImageDeleteMutation();

  const isCustomHero = !!heroImageData?.url;
  const heroUrl = toAbsoluteAssetUrl(heroImageData?.url) ?? "/images/hero.webp";

  const handleHeroImageDelete = async () => {
    const res = await mutateHeroImageDelete();
    if (!res.error) {
      toast.success("تصویر شخصی‌سازی‌شده حذف شد و تصویر پیش‌فرض نمایش داده می‌شود");
      setIsOpenHeroDelete(false);
    }
  };

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

          <div className="flex items-center gap-2">
            <Button
              variant={"primary"}
              className="rounded-[24px]"
              onClick={() => setIsOpenHeroUpdate(true)}
            >
              تغییر تصویر
            </Button>

            {isCustomHero && (
              <Button
                variant={"destructive"}
                className="rounded-[24px]"
                onClick={() => setIsOpenHeroDelete(true)}
              >
                حذف تصویر (بازگشت به پیش‌فرض)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <HeroImageUpdate isOpen={isOpenHeroUpdate} setIsOpen={setIsOpenHeroUpdate} />

      <ConfirmModal
        open={isOpenHeroDelete}
        onOpenChange={setIsOpenHeroDelete}
        onConfirm={handleHeroImageDelete}
        title="حذف تصویر صفحه اصلی"
        description="آیا از حذف تصویر شخصی‌سازی‌شده و بازگشت به تصویر پیش‌فرض مطمئن هستید؟"
        destructive
        loading={isLoadingHeroDelete}
      />
    </div>
  );
}