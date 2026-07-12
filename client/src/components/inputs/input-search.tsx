import SearchIcon from "#components/icons/search-icon";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { useState, useRef, useEffect } from "react";

export default function InputSearch() {
  const [isShowInput, setIsShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when it becomes visible
  useEffect(() => {
    if (isShowInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isShowInput]);

  return (
    <div className="relative flex items-center">
      {/* 
        This is the expanding container. 
        It handles the left-to-right width animation.
      */}
      <div
        className={cn(
          "flex items-center overflow-hidden transition-all duration-300 ease-in-out",
          isShowInput
            ? "w-[280px] opacity-100 rounded-[32px] border border-gray p-[3px] h-[45px]"
            : "w-0 opacity-0 p-0 border-0",
        )}
      >
        <input
          ref={inputRef}
          type="text"
          className="flex-1 w-full rounded-[32px] focus:outline-0 p-2 bg-transparent"
          placeholder="جستجوی دوره"
        />
        <Button className="h-full shrink-0">
          {"جستجو"} <SearchIcon />
        </Button>
      </div>

      {/* 
        The trigger button. 
        We position it absolutely to the left so it stays in place during the expansion.
      */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-10",
          "border rounded-full border-[#ABB7C2] p-1.5 size-[58px] flex items-center justify-center transition-opacity duration-200",
          isShowInput ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
        onClick={() => setIsShowInput(true)}
      >
        <SearchIcon className="rounded-full text-white bg-primary-300 size-full p-3" />
      </div>
    </div>
  );
}
