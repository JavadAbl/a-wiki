import { Separator } from "#components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/ui/tabs";
import { cn } from "#lib/utils";
import {
  Clock,
  FileMusicIcon,
  FileVideo2Icon,
  SquarePlayIcon,
  VideoIcon,
  Volume2Icon,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { courseActions } from "../../../../features/course/course-slice";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { formatSeconds } from "../../../../utils/app-utils";
import type { ContentDto } from "../../../../features/course/dto/content.dto";
import type { PartDto } from "../../../../features/course/dto/part.dto";
import type { SectionDto } from "../../../../features/course/dto/section.dto";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#components/ui/accordion";

// --- Content Item Component ---
// Extracted to keep the main component clean and reusable
function ContentItem({
  content,
  selectedContent,
  dis,
}: {
  content: ContentDto;
  selectedContent: ContentDto | null;
  dis: ReturnType<typeof useAppDispatch>;
}) {
  const isSelected = selectedContent?.id === content.id;

  return (
    <Fragment key={content.id || content.title}>
      <div
        className={cn(
          "flex items-center gap-3 p-1 rounded-md cursor-pointer transition-colors",
          isSelected
            ? "bg-blue-50 text-blue-600"
            : "hover:bg-gray-50 text-gray-700",
        )}
        onClick={() => {
          dis(courseActions.setCourseBrowserSelectedContent({ content }));
          setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
        }}
      >
        <div className="flex items-center gap-1 text-sm grow">
          {content.mediaType === "Video" && <VideoIcon size={16} />}
          {content.mediaType === "Audio" && <Volume2Icon size={16} />}
          {content.title}
        </div>

        <span
          className={cn(
            "flex items-center gap-1.5 text-content-tertiary bg-neutral-50 px-2.5 py-1 rounded-full text-xs font-medium tabular-nums shrink-0 ms-auto",
            isSelected ? "text-blue-500" : "text-gray-400",
          )}
        >
          <Clock size={14} />
          {formatSeconds(content.durationSeconds)}
        </span>
      </div>
      <Separator />
    </Fragment>
  );
}

// --- Part Contents (video/audio split inside one part) ---
function PartContents({
  part,
  selectedContent,
  dis,
}: {
  part: PartDto;
  selectedContent: ContentDto | null;
  dis: ReturnType<typeof useAppDispatch>;
}) {
  const videoContents =
    part.contents?.filter((c) => c.mediaType === "Video") || [];
  const audioContents =
    part.contents?.filter((c) => c.mediaType === "Audio") || [];

  const hasVideos = videoContents.length > 0;
  const hasAudios = audioContents.length > 0;

  const [activeTab, setActiveTab] = useState<"video" | "audio">(
    hasVideos ? "video" : "audio",
  );

  useEffect(() => {
    if (!hasVideos && activeTab === "video" && hasAudios) setActiveTab("audio");
    if (!hasAudios && activeTab === "audio" && hasVideos) setActiveTab("video");
  }, [hasVideos, hasAudios, activeTab]);

  return (
    <div className="p-2">
      {hasVideos && hasAudios && (
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "video" | "audio")}
          className="mb-2"
        >
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="video" className="flex-1 gap-2">
              <FileVideo2Icon size={16} /> ویدیوها ({videoContents.length})
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex-1 gap-2">
              <FileMusicIcon size={16} /> صوتی‌ها ({audioContents.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {((hasVideos && hasAudios && activeTab === "video") ||
        (hasVideos && !hasAudios)) && (
        <div>
          {videoContents.map((content) => (
            <ContentItem
              key={content.id || content.title}
              content={content}
              selectedContent={selectedContent}
              dis={dis}
            />
          ))}
        </div>
      )}

      {((hasVideos && hasAudios && activeTab === "audio") ||
        (!hasVideos && hasAudios)) && (
        <div>
          {audioContents.map((content) => (
            <ContentItem
              key={content.id || content.title}
              content={content}
              selectedContent={selectedContent}
              dis={dis}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
export default function CourseBrowserParts() {
  const dis = useAppDispatch();

  const {
    courseBrowserSelectedCourse: selectedCourse,
    courseBrowserSelectedContent: selectedContent,
    courseBrowserOpenAccordionItems: openAccordionItems,
  } = useAppSelector((s) => s.course);

  const sections: SectionDto[] = selectedCourse?.sections ?? [];

  // Accordion open-state lives in the shared course slice: the parts view is
  // rendered twice (top view + player slide-down), and both instances must
  // show the same open accordions when they swap.
  const handleAccordionValueChange = (items: string[]) => {
    dis(courseActions.setCourseBrowserOpenAccordionItems({ items }));
  };

  return (
    <div
      id="parts"
      className="bg-surface-100 rounded-[20px] px-[8px] pt-[8px] pb-[12px]"
    >
      <Tabs defaultValue="syllabus">
        <TabsList variant="line">
          <TabsTrigger value="syllabus">
            <SquarePlayIcon />
            سرفصل‌های دوره
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            درباره دوره
          </TabsTrigger>
        </TabsList>

        <Separator />

        <TabsContent value="syllabus">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-content-tertiary">
              <SquarePlayIcon className="size-10 mb-2 opacity-50" />

              <span className="text-sm">
                هیچ سرفصلی برای این دوره ثبت نشده است.
              </span>
            </div>
          ) : (
            <div className="p-2">
              <Accordion
                dir="rtl"
                multiple
                value={openAccordionItems}
                onValueChange={handleAccordionValueChange}
                className="w-full"
              >
                {sections.map((section) => (
                  <AccordionItem
                    key={section.id}
                    value={`section-${section.id}`}
                    className="border-b border-neutral-200 last:border-0"
                  >
                    <AccordionTrigger className="px-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <SquarePlayIcon className="size-4 text-primary-500" />

                        <span className="font-medium">{section.title}</span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-2 pb-3">
                      {section.parts?.length ? (
                        <Accordion
                          dir="rtl"
                          multiple
                          value={openAccordionItems}
                          onValueChange={handleAccordionValueChange}
                          className="rounded-xl border border-neutral-200 bg-neutral-50"
                        >
                          {section.parts.map((part) => (
                            <AccordionItem
                              key={part.id}
                              value={`part-${part.id}`}
                              className="px-2 border-neutral-200 last:border-0"
                            >
                              <AccordionTrigger className="px-2 hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <VideoIcon className="size-4 text-content-secondary" />

                                  <span className="text-sm font-medium">
                                    {part.title}
                                  </span>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="px-0 pb-2">
                                <div className="rounded-lg border border-neutral-100 bg-white">
                                  <PartContents
                                    part={part}
                                    selectedContent={selectedContent}
                                    dis={dis}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="py-4 text-center text-sm text-content-tertiary">
                          هیچ بخشی برای این سرفصل ثبت نشده است.
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </TabsContent>

        <TabsContent value="about">
          <div className="flex flex-col gap-3 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <span className="text-gray-600 leading-relaxed">
              {selectedCourse?.description}
            </span>

            <div className="flex flex-col gap-1 mt-2">
              <span className="font-semibold text-gray-900">
                {selectedCourse?.lecturer}
              </span>

              <span className="text-sm text-gray-500 italic">
                {selectedCourse?.lecturerProfession}
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
