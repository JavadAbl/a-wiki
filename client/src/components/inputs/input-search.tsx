import SearchIcon from "#components/icons/search-icon";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { useState } from "react";

export default function InputSearch() {
  const [isShowInput, setIsShowInput] = useState(false);

  if (!isShowInput)
    return (
      <div
        className={cn(
          "border-1 rounded-full border-[#ABB7C2] p-1.5 size-[58px] flex items-center justify-center",
        )}
        onClick={() => setIsShowInput(true)}
      >
        <SearchIcon className="rounded-full text-white bg-primary-300 size-full p-3" />
      </div>
    );

  return (
    <div
      className={cn(
        "flex items-stretch h-[45px] min-w-[175px] rounded-[32px] border border-gray p-[3px]",
      )}
    >
      <input
        type="text"
        className={cn("flex-1  rounded-[32px] focus:outline-0 p-2 ")}
        placeholder="جستجوی دوره"
      />

      <Button className={cn("h-auto")}>
        {"جستجو"} <SearchIcon />
      </Button>
    </div>
  );
}
