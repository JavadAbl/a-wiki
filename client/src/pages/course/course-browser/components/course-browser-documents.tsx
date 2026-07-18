import { cn } from "#lib/utils";
import { kbToMb } from "../../../../utils/app-utils";
import type { CourseDetailsDto } from "../../../../features/course/dto/course.details.dto";

interface Props {
  course: CourseDetailsDto;
}

export default function CourseBrowserDocuments({ course }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-primary-500 p-[16px_12px] rounded-[20px] gap-[16px] text-content-secondary",
      )}
    >
      {/* //Index Circle ---------------------------------------------------- */}
      <div className={cn(" font-h5")}>{"فایل‌های ضمیمه دوره"}</div>

      {/* //Titles ---------------------------------------------------- */}
      <div className={cn("flex flex-col gap-[16px] font-h5")}>
        {course?.documents?.map((doc) => (
          <a
            key={`Doc_${doc.id}`}
            href={doc.fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex justify-between items-center gap-[8px] rounded-[12px] p-[14px_16px] hover:bg-primary-400 cursor-pointer transition-colors",
            )}
          >
            <span>{doc.title}</span>
            <span>{kbToMb(doc.fileSize)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
