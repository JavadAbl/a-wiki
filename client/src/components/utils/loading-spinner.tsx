import { cn } from "#lib/utils";
import React from "react";

interface Props extends React.ComponentProps<"div"> {
  centerScreen?: boolean;
}
export default function LoadingSpinner({ centerScreen = false }: Props) {
  return (
    <div
      className={cn(
        centerScreen && " h-full w-full flex justify-center items-center",
      )}
    >
      <span className={cn("loading loading-ring loading-xl")} />
    </div>
  );
}
