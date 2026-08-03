import { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "#lib/utils";

import { useContentUpdateMutation } from "../../../../features/course/course-api";

// 1. Define the Props Interface
interface ContentItemProps {
  content: {
    id: number;
    title: string;
    order: number;
  };
  onDelete: () => void;
  onAcceptOrder: (contentId: number, newOrder: number) => void;
}

const AdminCourseContentItem = ({
  content,
  onDelete,
  onAcceptOrder,
}: ContentItemProps) => {
  // Separate state for Order editing
  const [orderValue, setOrderValue] = useState<string | number>(content.order);
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  // Separate state for Title editing
  const [titleValue, setTitleValue] = useState<string>(content.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Adjust the hook name to match your actual API definition
  const [mutateUpdateContent] = useContentUpdateMutation();

  // --- Order Handlers ---
  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOrderValue(val);
    setIsEditingOrder(Number(val) !== content.order);
  };

  const handleRejectOrder = () => {
    setOrderValue(content.order);
    setIsEditingOrder(false);
  };

  const handleAcceptOrder = async () => {
    setIsLoading(true);
    try {
      await onAcceptOrder(content.id, Number(orderValue));
      setIsEditingOrder(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Title Handlers ---
  const handleUpdateTitle = async () => {
    setIsLoading(true);
    try {
      await mutateUpdateContent({
        contentId: content.id,
        body: { title: titleValue },
      }).unwrap();

      console.log("Updating content title:", titleValue); // Placeholder
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update content title", error);
      setTitleValue(content.title); // Revert to original on failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectTitle = () => {
    setTitleValue(content.title);
    setIsEditingTitle(false);
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-muted rounded-full text-sm font-medium">
      <div className={cn("flex items-center gap-[16px] grow shrink")}>
        <span className="truncate flex-1">
          {/* Conditional Title Rendering */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                className="flex-1 h-7 text-xs bg-background border border-gray-300 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                autoFocus
              />
              <button
                onClick={handleUpdateTitle}
                className="text-green-600 hover:text-white hover:bg-green-600 transition-colors cursor-pointer rounded-md p-1 shrink-0"
                aria-label="Accept Title"
                title="تایید"
                disabled={isLoading}
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleRejectTitle}
                className="text-yellow-600 hover:text-white hover:bg-yellow-600 transition-colors cursor-pointer rounded-md p-1 shrink-0"
                aria-label="Reject Title"
                title="رد تغییرات"
                disabled={isLoading}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <span className="rounded-md px-1 truncate">{content.title}</span>
          )}
        </span>

        {/* Order Editing Section */}
        <div className="flex items-center gap-1 shrink-0">
          {isEditingOrder && (
            <div className="flex items-center gap-0.5 ml-1">
              <button
                onClick={handleAcceptOrder}
                className="text-green-600 hover:text-white hover:bg-green-600 transition-colors cursor-pointer rounded-md p-1"
                aria-label="Accept Order"
                title="تایید"
                disabled={isLoading}
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleRejectOrder}
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
            onChange={handleOrderChange}
            className="w-16 h-7 text-xs text-center bg-background border border-gray-300 rounded-md px-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow [appearance:textfield]"
          />
        </div>
      </div>

      {/* Action Buttons (Edit and Delete) */}
      <div className="flex items-center gap-1 shrink-0 ml-1">
        <button
          onClick={() => {
            setTitleValue(content.title);
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
          onClick={onDelete}
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

export default AdminCourseContentItem;
