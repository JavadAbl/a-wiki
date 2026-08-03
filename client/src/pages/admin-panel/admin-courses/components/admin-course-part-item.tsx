import { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "#lib/utils";
import type { PartDto } from "../../../../features/course/dto/part.dto";
import { usePartUpdateMutation } from "../../../../features/course/course-api";

// 1. Define the Props Interface
interface PartItemProps {
  part: PartDto;
  onDelete: () => void;
  onAcceptOrder: (contentId: number, newOrder: number) => void;
  onSelect: (part: PartDto) => any;
  isSelected: boolean;
  index: number;
}

const AdminCoursePartItem = ({
  part,
  onDelete,
  onSelect,
  onAcceptOrder,
  isSelected,
  index,
}: PartItemProps) => {
  // Separate state for Order editing
  const [orderValue, setOrderValue] = useState<string | number>(part.order);
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  // Separate state for Title editing
  const [titleValue, setTitleValue] = useState<string>(part.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [mutateUpdatePart] = usePartUpdateMutation();

  // --- Order Handlers ---
  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOrderValue(val);
    setIsEditingOrder(Number(val) !== part.order);
  };

  const handleRejectOrder = () => {
    setOrderValue(part.order);
    setIsEditingOrder(false);
  };

  const handleAcceptOrder = async () => {
    setIsLoading(true);
    try {
      await onAcceptOrder(part.id, Number(orderValue));
      setIsEditingOrder(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Title Handlers ---
  const handleUpdateTitle = async () => {
    setIsLoading(true);
    try {
      await mutateUpdatePart({
        partId: part.id,
        body: { title: titleValue },
      }).unwrap();
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update part title", error);
      setTitleValue(part.title); // Revert to original on failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectTitle = () => {
    setTitleValue(part.title);
    setIsEditingTitle(false);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-1.5 bg-muted rounded-full text-sm font-medium hover:bg-primary-200/10",
        isSelected && "bg-primary-300/25 border border-primary-300",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-[16px] grow shrink cursor-pointer",
        )}
        onClick={() => onSelect(part)}
      >
        <span className="flex items-center gap-1 truncate flex-1">
          <span className="p-1 bg-neutral-50 rounded-full size-5 flex items-center justify-center text-xs shrink-0">
            {`${index + 1}-`}
          </span>

          {/* Conditional Title Rendering */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent triggering onSelect
                className="flex-1 h-7 text-xs bg-background border border-gray-300 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                autoFocus
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateTitle();
                }}
                className="text-green-600 hover:text-white hover:bg-green-600 transition-colors cursor-pointer rounded-md p-1 shrink-0"
                aria-label="Accept Title"
                title="تایید"
                disabled={isLoading}
              >
                <Check size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectTitle();
                }}
                className="text-yellow-600 hover:text-white hover:bg-yellow-600 transition-colors cursor-pointer rounded-md p-1 shrink-0"
                aria-label="Reject Title"
                title="رد تغییرات"
                disabled={isLoading}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <span className="rounded-md px-1 truncate">{part.title}</span>
          )}
        </span>

        {/* Order Editing Section */}
        <div className="flex items-center gap-1 shrink-0">
          {isEditingOrder && (
            <div className="flex items-center gap-0.5 ml-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptOrder();
                }}
                className="text-green-600 hover:text-white hover:bg-green-600 transition-colors cursor-pointer rounded-md p-1"
                aria-label="Accept Order"
                title="تایید"
                disabled={isLoading}
              >
                <Check size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectOrder();
                }}
                className="text-yellow-600 hover:text-white hover:bg-yellow-600 transition-colors cursor-pointer rounded-md p-1"
                aria-label="Reject Order"
                title="رد تغییرات"
                disabled={isLoading}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <span className="text-xs text-muted-foreground">ترتیب:</span>

          <input
            type="number"
            value={orderValue}
            onChange={(e) => {
              e.stopPropagation();
              handleOrderChange(e);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-16 h-7 text-xs text-center bg-background border border-gray-300 rounded-md px-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow [appearance:textfield]"
          />
        </div>
      </div>

      {/* Action Buttons (Edit and Delete) */}
      <div className="flex items-center gap-1 shrink-0 ml-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTitleValue(part.title);
            setIsEditingTitle(true);
          }}
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer rounded-full p-1"
          aria-label="Edit Title"
          title="ویرایش عنوان"
          disabled={isEditingTitle || isLoading}
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/25 transition-colors cursor-pointer rounded-full p-1"
          aria-label="Remove"
          title="حذف"
          disabled={isEditingTitle || isLoading}
        >
          <X size={14} className="text-destructive" />
        </button>
      </div>
    </div>
  );
};

export default AdminCoursePartItem;
