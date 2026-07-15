import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "#components/ui/dialog";
import { cn } from "#lib/utils";
import { Button } from "#components/ui/button";
import { XIcon, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructive?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "تایید",
  cancelText = "انصراف",
  loading = false,
  destructive = false,
}: ConfirmModalProps) {
  // Prevent closing the modal via overlay click or ESC key while loading
  const handleOpenChange = (isOpen: boolean) => {
    if (!loading) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("p-0 rounded-[10px]")}
        // Shadcn/ui supports hiding the default close button if you are providing a custom one
        // If your version doesn't support this prop, you can hide it via CSS instead
      >
        <DialogHeader className="bg-surface-300 py-[10px] px-[16px] rounded-t-[10px] border-b border-neutral-200">
          <DialogTitle className={cn("flex justify-between items-center p-0")}>
            <span className={cn("text-primary-300 font-h3 ")}>{title}</span>

            <XIcon
              className={cn(
                "text-white bg-gray-400 rounded-full p-1 cursor-pointer transition-colors hover:bg-gray-500",
                loading && "cursor-not-allowed opacity-50",
              )}
              onClick={() => handleOpenChange(false)}
              width={24}
              height={24}
            />
          </DialogTitle>

          {description && (
            <DialogDescription className="pt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Footer with Action Buttons */}
        <DialogFooter className="p-4 flex flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
