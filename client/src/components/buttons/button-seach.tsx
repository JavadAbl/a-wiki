import SearchIcon from "#components/icons/search-icon";
import { cn } from "#lib/utils";
import type { ComponentProps } from "react";

export default function ButtonSearch(props: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-1 rounded-full border-[#ABB7C2] p-1.5 size-16 flex items-center justify-center",
      )}
      {...props}
    >
      <SearchIcon className="rounded-full text-white bg-primary-300 size-full p-3" />
    </div>
  );
}
