import { Separator } from "#components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/ui/tabs";
import { useAppSelector } from "#hooks/redux-hooks";
import { cn } from "#lib/utils";
import { ChevronLeftIcon, SquarePlayIcon, Users2Icon } from "lucide-react";
import { useState } from "react";

export default function CourseBrowserParts() {
  const selectedSection = useAppSelector(
    (s) => s.course.courseBrowserSelectedSection,
  );

  const [openPartIndex, setOpenPartIndex] = useState(null);

  const handleToggle = (index: any) => {
    // If clicking the already open part, close it. Otherwise, open the clicked one.
    setOpenPartIndex(openPartIndex === index ? null : index);
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
              const isOpen = openPartIndex === index;

              return (
                <div
                  key={index}
                  className="border border-gray-100 bg-surface-200 text-content-primary mb-2 rounded-lg overflow-hidden"
                >
                  {/* Accordion Header (Clickable) */}
                  <div
                    onClick={() => handleToggle(index)}
                    className={cn(
                      "flex justify-between items-center p-[18px_12px] cursor-pointer hover:bg-surface-300 transition-colors",
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
                      {part.contents.map((content, contentIndex) => (
                        <div
                          key={contentIndex}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                        >
                          {/* Added a placeholder icon or number for the content */}
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full text-xs">
                            {contentIndex + 1}
                          </span>
                          <span className="text-sm text-gray-700">
                            {content.title}
                          </span>
                        </div>
                      ))}
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
