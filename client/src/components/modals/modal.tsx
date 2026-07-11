import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#components/ui/dialog";
import { cn } from "#lib/utils";
import { XIcon } from "lucide-react";
import type React from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("p-0 rounded-[10px]")}>
        <DialogHeader className="bg-surface-300 py-[10px] px-[16px] rounded-t-[10px] border-b border-neutral-200">
          <DialogTitle className={cn("flex justify-between  p-0")}>
            <span className={cn("text-primary-300 font-h3 ")}>{title}</span>

            <XIcon
              className={cn(
                " text-white bg-gray-400 rounded-full p-1 cursor-pointer",
              )}
              onClick={() => onOpenChange(false)}
            />
          </DialogTitle>

          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}
        {/* <DialogFooter>{children}</DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
