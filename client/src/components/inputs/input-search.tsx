import SearchIcon from "#components/icons/search-icon";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";

export default function InputSearch() {
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isShowInput, setIsShowInput] = useState(false);

  // Initialize query from URL if the app starts on /Courses
  const [query, setQuery] = useState(() => {
    return location.pathname.startsWith("/Courses")
      ? searchParams.get("search") || ""
      : "";
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract the primitive value to use as a stable dependency
  const currentSearchParam = searchParams.get("search") || "";

  // Sync query state if URL changes (e.g., user uses browser back/forward or navigates via other links)
  useEffect(() => {
    const run = () => {
      if (location.pathname.startsWith("/Courses")) {
        setQuery(currentSearchParam);
      } else {
        setQuery("");
      }
    };

    run();
  }, [location.pathname, currentSearchParam]);

  // Centralized search handler for scalability
  const handleSearch = useCallback(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      // If query is empty and we are on /Courses, remove the param from URL
      if (
        location.pathname.startsWith("/Courses") &&
        searchParams.has("search")
      ) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("search");
        setSearchParams(newParams, { replace: true });
      }
      return;
    }

    if (location.pathname.startsWith("/Courses")) {
      // If already on Courses route, update the URL parameter in place
      const newParams = new URLSearchParams(searchParams);
      newParams.set("search", trimmedQuery);
      setSearchParams(newParams, { replace: true });
    } else {
      // Otherwise, navigate to Courses with the query
      nav(`/Courses?search=${trimmedQuery}`);
    }
  }, [nav, query, location.pathname, searchParams, setSearchParams]);

  const handleClear = useCallback(() => {
    setQuery("");

    // Remove from URL if currently on /Courses
    if (
      location.pathname.startsWith("/Courses") &&
      searchParams.has("search")
    ) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      setSearchParams(newParams, { replace: true });
    }

    inputRef.current?.focus();
  }, [location.pathname, searchParams, setSearchParams]);

  // Handle auto-focus and click-outside behavior
  useEffect(() => {
    if (isShowInput && inputRef.current) {
      inputRef.current.focus();
    }

    if (!isShowInput) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // ✅ Only close if the input is empty
        if (!query.trim()) {
          setIsShowInput(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isShowInput, query]); // Added query to dependencies

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Expanding container */}
      <div
        className={cn(
          "flex items-center overflow-hidden transition-all duration-300 ease-in-out",
          isShowInput
            ? "w-[280px] opacity-100 rounded-[32px] border border-gray p-[3px] h-[45px]"
            : "w-0 opacity-0 p-0 border-0",
        )}
      >
        {/* Wrapper for input and clear icon */}
        <div className="relative flex-1 w-full h-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full rounded-[32px] focus:outline-0 p-2 pr-8 bg-transparent"
            placeholder="جستجوی دوره"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-700 transition-colors flex items-center justify-center"
              aria-label="پاک کردن"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <Button
          className="h-full shrink-0"
          onClick={handleSearch}
          type="button"
        >
          {"جستجو"} <SearchIcon />
        </Button>
      </div>

      {/* Trigger button */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-10",
          "border rounded-full border-[#ABB7C2] p-1.5 size-[58px] flex items-center justify-center transition-opacity duration-200",
          isShowInput
            ? "opacity-0 pointer-events-none"
            : "opacity-100 cursor-pointer",
        )}
        onClick={() => setIsShowInput(true)}
      >
        <SearchIcon className="rounded-full text-white bg-primary-300 size-full p-3" />
      </div>
    </div>
  );
}
