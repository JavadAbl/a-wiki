import { cn } from "#lib/utils";
import type React from "react";

interface Props {
  isLoading: boolean;
  children: React.ReactNode;
  // optional: add a min-height to preserve layout while loading
  minHeight?: string;
}

export default function LoadingContainer({
  isLoading,
  children,
  minHeight = "min-h-[200px]", // adjust as needed
}: Props) {
  return (
    <div
      className={cn(
        "relative w-full",
        isLoading && "flex items-center justify-center",
        minHeight,
      )}
    >
      {isLoading ? (
        // Tailwind's built‑in spinner (requires no extra library)
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      ) : (
        children
      )}
    </div>
  );
}
