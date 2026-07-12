// components/ui/form-message-fixed.tsx

import { cn } from "#lib/utils";
import type React from "react";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function InputMessage({ children, className }: Props) {
  return (
    <span className={cn("min-h-[20px] text-sm", className)}>{children}</span>
  );
}
