import { Separator } from "#components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/ui/tabs";
import { cn } from "#lib/utils";
import {
  ChevronLeftIcon,
  Clock,
  SquarePlayIcon,
  Users2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { courseActions } from "../../../../features/course/course-slice";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { formatSeconds } from "../../../../utils/app-utils";

export default function CourseBrowserParts() {
  const dis = useAppDispatch();
  const {
    courseBrowserSelectedSection: selectedSection,
    courseBrowserSelectedContent: selectedContent,
  } = useAppSelector((s) => s.course);

  // Changed to an array to support multiple open parts
  const [openParts, setOpenParts] = useState<number[]>([]);

  // When selectedSection changes, open all its parts by default
  useEffect(() => {
    if (selectedSection?.parts?.length) {
      setOpenParts(selectedSection.parts.map((_, index) => index));
    } else {
      setOpenParts([]);
    }
  }, [selectedSection]);

  const handleToggle = (index: number, part: any) => {
    const isOpen = openParts.includes(index);

    if (isOpen) {
      // Close the part
      setOpenParts((prev) => prev.filter((i) => i !== index));
    } else {
      // Open the part
      setOpenParts((prev) => [...prev, index]);
    }
  };

  return (
    <div
      className={cn(
        "bg-surface-100 rounded-[20px] px-[8px] pt-[8px] pb-[12px]",
      )}
    >
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="parts">
            <SquarePlayIcon />
            {"انتخاب بخش ها"}
          </TabsTrigger>

          <TabsTrigger value="lecturer">
            <Users2Icon /> {"مدرس"}
          </TabsTrigger>

          <TabsTrigger value="about">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="#4A5565"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {"درباره دوره"}
          </TabsTrigger>
        </TabsList>

        <Separator />

        <TabsContent value="parts">
          <div className="p-4">
            {selectedSection?.parts?.map((part, index) => {
              const isOpen = openParts.includes(index);

              return (
                <div
                  key={index}
                  className="border border-gray-100 bg-primary-500/25 text-content-primary mb-2 rounded-lg overflow-hidden"
                >
                  {/* Accordion Header (Clickable) */}
                  <div
                    onClick={() => handleToggle(index, part)}
                    className={cn(
                      "flex justify-between items-center p-[18px_12px] cursor-pointer hover:bg-primary-500/75 transition-colors",
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {/* Rotate icon when open */}
                      <ChevronLeftIcon
                        className={cn(
                          "w-5 h-5 transition-transform duration-300",
                          isOpen && "-rotate-90",
                        )}
                      />
                      {part.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      {`${part.contents.length} قسمت`}
                    </span>
                  </div>

                  {/* Accordion Content (Shows when open) */}
                  {isOpen && (
                    <div className="bg-white border-t border-gray-100 p-2">
                      {part.contents.map(
                        (content: any, contentIndex: number) => {
                          // Check if this content is the currently selected one
                          const isSelected = selectedContent === content;

                          return (
                            <div
                              key={contentIndex}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                                isSelected
                                  ? "bg-blue-50 text-blue-600" // Active/Selected styling
                                  : "hover:bg-gray-50 text-gray-700", // Default hover styling
                              )}
                              onClick={() =>
                                dis(
                                  courseActions.setCourseBrowserSelectedContent(
                                    {
                                      content,
                                    },
                                  ),
                                )
                              }
                            >
                              {/* Added a placeholder icon or number for the content */}
                              <span
                                className={cn(
                                  "w-6 h-6 flex items-center justify-center rounded-full text-xs transition-colors shrink-0",
                                  isSelected
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-600",
                                )}
                              >
                                {contentIndex + 1}
                              </span>

                              <span className="text-sm grow">
                                {content.title}
                              </span>

                              {/* Duration Display */}
                              <span
                                className={cn(
                                  "flex items-center gap-1.5 text-content-tertiary bg-neutral-50 px-2.5 py-1 rounded-full text-xs font-medium tabular-nums shrink-0 ms-auto",
                                  isSelected
                                    ? "text-blue-500"
                                    : "text-gray-400",
                                )}
                              >
                                <Clock size={14} />
                                {formatSeconds(content.durationSeconds)}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="lecturer">
          <div className=""></div>
        </TabsContent>

        <TabsContent value="about">
          <div className=""></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
