import { useState } from "react";
import { Check, X } from "lucide-react"; // or your preferred icon library
import { cn } from "#lib/utils";
import type { SectionDto } from "../../../../features/course/dto/section.dto";

// 1. Define the Props Interface
interface SectionItemProps {
  section: SectionDto;
  onDelete: () => void;
  onAcceptOrder: (contentId: number, newOrder: number) => void;
  onSelect: (section: SectionDto) => any;
  isSelected: boolean;
}

const AdminCourseSectionItem = ({
  section,
  onDelete,
  onSelect,
  onAcceptOrder,
  isSelected,
}: SectionItemProps) => {
  const [inputValue, setInputValue] = useState<string | number>(section.order);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsEditing(Number(val) !== section.order);
  };

  const handleReject = () => {
    setInputValue(section.order);
    setIsEditing(false);
  };

  const handleAccept = async () => {
    setIsLoading(true);
    await onAcceptOrder(section.id, Number(inputValue));
    setIsEditing(false);
    setIsLoading(false);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-1.5 bg-muted rounded-full text-sm font-medium",
        isSelected && "bg-primary-300/25",
      )}
    >
      <div className={cn("flex items-center gap-[16px] grow shrink")}>
        <span className="truncate flex-1 ">
          <span
            className="hover:bg-primary-200/20 cursor-pointer rounded-md px-1"
            onClick={() => onSelect(section)}
          >
            {section.title}
          </span>
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {/* Conditionally render Accept/Reject buttons right next to the input */}
          {isEditing && (
            <div className="flex items-center gap-0.5 ml-1">
              <button
                onClick={handleAccept}
                className="text-green-600 hover:text-white hover:bg-green-600 transition-colors cursor-pointer rounded-md p-1"
                aria-label="Accept"
                title="تایید"
                disabled={isLoading}
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleReject}
                className="text-yellow-600 hover:text-white hover:bg-yellow-600 transition-colors cursor-pointer rounded-md p-1"
                aria-label="Reject"
                title="رد تغییرات"
                disabled={isLoading}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <span className="text-xs text-muted-foreground">ترتیب:</span>

          {/* 3. Input styled to clearly look editable */}
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            className="w-18 h-7 text-xs text-center bg-background border border-gray-300 rounded-md px-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow [appearance:textfield] "
          />
        </div>
      </div>

      {/* Delete Button (Always visible on the far right) */}
      <button
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer hover:bg-destructive/25 rounded-full p-1 shrink-0 ml-1"
        aria-label="Remove"
        title="حذف"
      >
        <X size={14} className="text-destructive" />
      </button>
    </div>
  );
};

export default AdminCourseSectionItem;
