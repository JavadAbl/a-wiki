import { Modal } from "#components/modals/modal";
import { useCourseSetPublishedMutation } from "../../../../features/course/course-api";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "#components/ui/radio-group";
import { Label } from "#components/ui/label";
import { Button } from "#components/ui/button";
import { Loader2 } from "lucide-react";
import type { CourseDto } from "../../../../features/course/dto/course.dto";
import { cn } from "#lib/utils";

interface Props {
  setIsOpen: (open: boolean) => any;
  course?: CourseDto | null;
}

export default function CourseSetPublished({ setIsOpen, course }: Props) {
  const [isPublished, setIsPublished] = useState<boolean | null>(null);

  const [mutate, { isLoading }] = useCourseSetPublishedMutation();

  // Sync state when modal opens or course changes
  useEffect(() => {
    const run = () => {
      if (course) {
        setIsPublished(course.isPublished ?? false);
      }
    };

    run();
  }, [course]);

  if (!course) return null;

  const handleSubmit = async () => {
    if (isPublished === null) return;

    const res = await mutate({
      body: { isPublished },
      courseId: course.id,
    });
    if (!res.error) {
      setIsOpen(false);
    }
  };

  return (
    <Modal
      open={!!course}
      onOpenChange={setIsOpen}
      title="تغییر وضعیت انتشار"
      description={`وضعیت انتشار دوره «${course.title}» را مشخص کنید.`}
    >
      <div className="space-y-6 p-6">
        <RadioGroup
          value={isPublished === null ? undefined : String(isPublished)}
          onValueChange={(val) => setIsPublished(val === "true")}
          className="space-y-3"
          dir="rtl"
        >
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 transition-colors",
              isPublished === true
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-muted",
            )}
          >
            <RadioGroupItem value="true" id="published" />
            <Label
              htmlFor="published"
              className="flex-1 cursor-pointer text-sm font-medium"
            >
              منتشر شده
            </Label>
            <span className="text-xs text-muted-foreground">
              دوره برای همه کاربران قابل مشاهده خواهد بود
            </span>
          </div>

          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 transition-colors",
              isPublished === false
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                : "border-muted",
            )}
          >
            <RadioGroupItem value="false" id="draft" />
            <Label
              htmlFor="draft"
              className="flex-1 cursor-pointer text-sm font-medium"
            >
              پیش‌نویس
            </Label>
            <span className="text-xs text-muted-foreground">
              دوره فقط برای شما قابل مشاهده خواهد بود
            </span>
          </div>
        </RadioGroup>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            انصراف
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            ذخیره تغییرات
          </Button>
        </div>
      </div>
    </Modal>
  );
}
