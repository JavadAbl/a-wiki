import { cn } from "#lib/utils";
import { Search } from "lucide-react";
import type { ComponentProps } from "react";

export default function SearchIcon(props: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-1 rounded-full border-[#ABB7C2] p-1.5 size-16 flex items-center justify-center",
      )}
      {...props}
    >
      <Search className="rounded-full text-white bg-primary-300 size-full p-3" />
    </div>
  );
}
