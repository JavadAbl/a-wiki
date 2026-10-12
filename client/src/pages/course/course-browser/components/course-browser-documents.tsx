import { cn } from "#lib/utils";
import type { CourseDetailsDto } from "../../../../features/course/dto/course.details.dto";
import { Paperclip, Download } from "lucide-react";

interface Props {
  course: CourseDetailsDto;
  /**
   * "vertical" (default): the narrow sidebar column used next to the player.
   * "horizontal": a full-width layout that spreads the documents across the
   * page in a responsive grid — used for courses that ship only files.
   */
  layout?: "vertical" | "horizontal";
}

export default function CourseBrowserDocuments({
  course,
  layout = "vertical",
}: Props) {
  const hasDocuments = course?.documents && course.documents.length > 0;
  const isHorizontal = layout === "horizontal";

  return (
    <div className="flex flex-col gap-6 rounded-[24px] bg-surface-100 p-6 text-content-primary shadow-lg">
      {/* Header Section */}
      <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary-400/30 ring-2 ring-primary-400/50">
          <Paperclip className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold font-h5">
            {isHorizontal
              ? `فایل‌های ضمیمه دوره ${course?.title ?? ""}`.trim()
              : "فایل‌های ضمیمه دوره"}
          </h3>
          <p className="text-xs text-content-tertiary mt-0.5">
            {hasDocuments
              ? `${course.documents.length} فایل موجود است`
              : "فایلی ضمیمه نشده است"}
          </p>
        </div>
      </div>

      {/* Documents List Section */}
      {hasDocuments ? (
        <div
          className={cn(
            "gap-3",
            isHorizontal
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col max-h-[400px] overflow-y-auto pr-1",
          )}
        >
          {course.documents.map((doc) => (
            // Removed the Fragment <> and moved the key directly to the <a> tag
            <a
              key={`Doc_${doc.id}`}
              href={doc.fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex items-center justify-between gap-4 rounded-xl p-4 transition-all duration-300",
                "bg-primary/15 hover:bg-primary hover:shadow-md",
                "border border-transparent hover:border-white/10",
              )}
            >
              {/* File Info */}
              <div className="flex items-center gap-3 min-w-0">
                <span className=" font-medium group-hover:text-primary-100 transition-colors text-xs">
                  {doc.title}
                </span>
              </div>

              {/* File Actions/Meta */}
              <div className="relative flex items-center shrink-0 text-content-secondary">
                {/* Added group-hover:opacity-0 to hide on hover */}
                <span className="text-xs bg-primary-400 px-2.5 py-1 rounded-full transition-all duration-300 group-hover:opacity-0">
                  {`${doc.fileSize} کیلوبایت`}
                </span>

                <div className="absolute right-0 flex items-center justify-center w-8 h-8 rounded-full opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:-translate-x-12 transition-all duration-300 group-hover:bg-primary-600 group-hover:text-primary-100">
                  <Download className="w-4 h-4" />
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-8 text-center text-primary-200/70">
          <Paperclip className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium font-h5">
            هنوز هیچ فایلی برای این دوره آپلود نشده است.
          </p>
        </div>
      )}
    </div>
  );
}
