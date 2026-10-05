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

// --- Pill button used for the section/part tab levels ---
function PillButton({
  active,
  onClick,
  children,
  level,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  level: "section" | "part";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border transition-colors whitespace-nowrap",
        level === "section"
          ? "px-4 py-1.5 text-sm font-medium"
          : "px-3 py-1 text-xs",
        active
          ? level === "section"
            ? "border-transparent bg-primary-500 text-white"
            : "border-primary-500/40 bg-primary-500/10 text-primary-600"
          : "border-neutral-200 bg-white text-content-secondary hover:border-primary-500/40 hover:text-primary-600",
      )}
    >
      {children}
    </button>
  );
}

// --- Main Component ---
export default function CourseBrowserParts() {
  const dis = useAppDispatch();
  const {
    courseBrowserSelectedCourse: selectedCourse,
    courseBrowserSelectedContent: selectedContent,
  } = useAppSelector((s) => s.course);

  const sections: SectionDto[] = selectedCourse?.sections ?? [];

  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [activePartId, setActivePartId] = useState<number | null>(null);

  // Keep selection valid when course data changes
  useEffect(() => {
    if (sections.length === 0) {
      setActiveSectionId(null);
      setActivePartId(null);
      return;
    }
    if (!sections.some((s) => s.id === activeSectionId)) {
      setActiveSectionId(sections[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  const activeSection: SectionDto | null =
    sections.find((s) => s.id === activeSectionId) ?? sections[0] ?? null;

  const parts: PartDto[] = activeSection?.parts ?? [];

  useEffect(() => {
    if (parts.length === 0) {
      setActivePartId(null);
      return;
    }
    if (!parts.some((p) => p.id === activePartId)) {
      setActivePartId(parts[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts]);

  const activePart: PartDto | null =
    parts.find((p) => p.id === activePartId) ?? parts[0] ?? null;

  return (
    <div
      id="parts"
      className={cn(
        "bg-surface-100 rounded-[20px] px-[8px] pt-[8px] pb-[12px]",
      )}
    >
      <Tabs defaultValue="syllabus">
        <TabsList variant="line">
          <TabsTrigger value="syllabus">
            <SquarePlayIcon />
            {"سرفصل های دوره"}
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

        <TabsContent value="syllabus">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-content-tertiary">
              <SquarePlayIcon className="size-10 mb-2 opacity-50" />
              <span className="text-sm">
                هیچ سرفصلی برای این دوره ثبت نشده است.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-2">
              {/* Level 1: Sections */}
              <div className="flex flex-wrap items-center gap-2">
                {sections.map((section) => (
                  <PillButton
                    key={section.id}
                    level="section"
                    active={section.id === activeSection?.id}
                    onClick={() => setActiveSectionId(section.id)}
                  >
                    {section.title}
                  </PillButton>
                ))}
              </div>

              {/* Level 2: Parts of the active section */}
              {parts.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-100 p-2">
                  {parts.map((part) => (
                    <PillButton
                      key={part.id}
                      level="part"
                      active={part.id === activePart?.id}
                      onClick={() => setActivePartId(part.id)}
                    >
                      {part.title}
                    </PillButton>
                  ))}
                </div>
              )}

              {/* Level 3: Contents of the active part */}
              <div className="rounded-xl border border-neutral-100 bg-white">
                {activePart ? (
                  <PartContents
                    part={activePart}
                    selectedContent={selectedContent}
                    dis={dis}
                  />
                ) : (
                  <div className="py-8 text-center text-sm text-content-tertiary">
                    هیچ بخشی برای این فصل ثبت نشده است.
                  </div>
                )}
              </div>
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