import { Modal } from "#components/modals/modal";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "#components/ui/radio-group";
import { Label } from "#components/ui/label";
import { Button } from "#components/ui/button";
import { Loader2 } from "lucide-react";
import type { UserDto } from "../../../../features/user/dto/user.dto";
import { cn } from "#lib/utils";
import { useUserUpdateMutation } from "../../../../features/user/user-api";

interface Props {
  close: () => any;
  user?: UserDto | null;
}

export default function UserSetActive({ close, user }: Props) {
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const [mutate, { isLoading }] = useUserUpdateMutation();

  // Sync state when modal opens or user changes
  useEffect(() => {
    const run = () => {
      if (user) {
        setIsActive(user.isActive ?? false);
      }
    };

    run();
  }, [user]);

  if (!user) return null;

  const handleSubmit = async () => {
    if (isActive === null) return;

    const res = await mutate({
      body: { isActive },
      userId: user.id,
    });
    if (!res.error) {
      close();
    }
  };

  return (
    <Modal
      open={!!user}
      onOpenChange={close}
      title="تغییر وضعیت انتشار"
      description={`وضعیت فعال بودن کاربر «${user.lastName}» را مشخص کنید.`}
    >
      <div className="space-y-6 p-6">
        <RadioGroup
          value={isActive === null ? undefined : String(isActive)}
          onValueChange={(val) => setIsActive(val === "true")}
          className="space-y-3"
          dir="rtl"
        >
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 transition-colors",
              isActive === true
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-muted",
            )}
          >
            <RadioGroupItem value="true" id="published" />
            <Label
              htmlFor="published"
              className="flex-1 cursor-pointer text-sm font-medium"
            >
              فعال
            </Label>
          </div>

          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 transition-colors",
              isActive === false
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                : "border-muted",
            )}
          >
            <RadioGroupItem value="false" id="draft" />
            <Label
              htmlFor="draft"
              className="flex-1 cursor-pointer text-sm font-medium"
            >
              غیر فعال
            </Label>
            <span className="text-xs text-muted-foreground">
              {"کاربر دیگر امکان لاگین نخواهد داشت"}
            </span>
          </div>
        </RadioGroup>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={close} disabled={isLoading}>
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
