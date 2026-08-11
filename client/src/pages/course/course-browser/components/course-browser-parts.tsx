import { Separator } from "#components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/ui/tabs";
import { cn } from "#lib/utils";
import {
  ChevronLeftIcon,
  Clock,
  FileMusicIcon,
  FileVideo2Icon,
  SquarePlayIcon,
  VideoIcon,
  Volume1Icon,
  Volume2Icon,
} from "lucide-react";
import { useEffect, useState, Fragment } from "react";
import { courseActions } from "../../../../features/course/course-slice";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { formatSeconds } from "../../../../utils/app-utils";

// --- Content Item Component ---
// Extracted to keep the main component clean and reusable
function ContentItem({ content, part, selectedContent, dis }: any) {
  const isSelected = selectedContent === content;
  // Preserve the original syllabus numbering regardless of the active tab
  const originalIndex = part.contents.indexOf(content);

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
        {/*   <span
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded-full text-xs transition-colors shrink-0",
            isSelected
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600",
          )}
        >
          {originalIndex + 1}
        </span> */}

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

// --- Part Accordion Component ---
function PartAccordion({
  part,
  index,
  isOpen,
  handleToggle,
  selectedContent,
  dis,
}: any) {
  // Categorize contents by mediaType
  const videoContents =
    part.contents?.filter((c: any) => c.mediaType === "Video") || [];
  const audioContents =
    part.contents?.filter((c: any) => c.mediaType === "Audio") || [];

  const hasVideos = videoContents.length > 0;
  const hasAudios = audioContents.length > 0;

  // Default active tab based on available content
  const [activeTab, setActiveTab] = useState<"video" | "audio">(
    hasVideos ? "video" : "audio",
  );

  // Fallback to an available tab if the current one becomes empty dynamically
  useEffect(() => {
    if (!hasVideos && activeTab === "video" && hasAudios) setActiveTab("audio");
    if (!hasAudios && activeTab === "audio" && hasVideos) setActiveTab("video");
  }, [hasVideos, hasAudios, activeTab]);

  return (
    <div className="border border-gray-100 bg-primary-500/5 text-content-primary mb-2 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        onClick={() => handleToggle(index)}
        className={cn(
          "flex justify-between items-center p-[12px_12px] cursor-pointer hover:bg-primary-500/25 transition-colors",
        )}
      >
        <span className="flex items-center gap-2 font-medium">
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

      {/* Content */}
      {isOpen && (
        <div className="bg-white border-t border-gray-100 p-2">
          {/* Nested Tabs (Only rendered if BOTH Video and Audio exist) */}
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

          {/* Video List */}
          {((hasVideos && hasAudios && activeTab === "video") ||
            (hasVideos && !hasAudios)) && (
            <div>
              {videoContents.map((content: any) => (
                <ContentItem
                  key={content.id || content.title}
                  content={content}
                  part={part}
                  selectedContent={selectedContent}
                  dis={dis}
                />
              ))}
            </div>
          )}

          {/* Audio List */}
          {((hasVideos && hasAudios && activeTab === "audio") ||
            (!hasVideos && hasAudios)) && (
            <div>
              {audioContents.map((content: any) => (
                <ContentItem
                  key={content.id || content.title}
                  content={content}
                  part={part}
                  selectedContent={selectedContent}
                  dis={dis}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
export default function CourseBrowserParts() {
  const dis = useAppDispatch();
  const {
    courseBrowserSelectedSection: selectedSection,
    courseBrowserSelectedCourse: selectedCourse,
    courseBrowserSelectedContent: selectedContent,
  } = useAppSelector((s) => s.course);

  const [openParts, setOpenParts] = useState<number[]>([]);

  useEffect(() => {
    if (selectedSection?.parts?.length) {
      setOpenParts(selectedSection.parts.map((_, index) => index));
    } else {
      setOpenParts([]);
    }
  }, [selectedSection]);

  const handleToggle = (index: number) => {
    const isOpen = openParts.includes(index);
    if (isOpen) {
      setOpenParts((prev) => prev.filter((i) => i !== index));
    } else {
      setOpenParts((prev) => [...prev, index]);
    }
  };

  return (
    <div
      id="parts"
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
                strokeWidth="2" // Fixed React camelCase warning
                strokeLinecap="round"
                strokeLinejoin="round"
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
                <PartAccordion
                  key={index}
                  part={part}
                  index={index}
                  isOpen={isOpen}
                  handleToggle={handleToggle}
                  selectedContent={selectedContent}
                  dis={dis}
                />
              );
            })}
          </div>
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
