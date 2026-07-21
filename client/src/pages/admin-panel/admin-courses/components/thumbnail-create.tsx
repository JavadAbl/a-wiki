import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Field, FieldLabel } from "#components/ui/field";
import { toast } from "sonner";
import { InputMessage } from "#components/inputs/input-message";
import {
  useThumbnailCreateMutation,
  useThumbnailDeleteMutation,
} from "../../../../features/course/course-api";
import { useState, useCallback, useRef, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
  courseId: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function ThumbnailCreate({
  isOpen,
  setIsOpen,
  courseId,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mutateDeleteThumbnail] = useThumbnailDeleteMutation();
  const [mutateCreateThumbnail] = useThumbnailCreateMutation();

  // Handle image preview creation and cleanup
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("حجم فایل نباید بیشتر از ۲ مگابایت باشد");
      return false;
    }

    // Check file type
    const isAllowed = ALLOWED_TYPES.includes(file.type);
    if (!isAllowed) {
      setFileError("فقط فایل‌های تصویری (JPG, PNG, GIF, WebP) مجاز هستند");
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      "image/jpeg": "JPG",
      "image/png": "PNG",
      "image/gif": "GIF",
      "image/webp": "WebP",
    };
    return typeMap[type] || "تصویر";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  async function handleSubmit() {
    if (!file) {
      toast.error("لطفاً یک تصویر انتخاب کنید");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    const resDelete = await mutateDeleteThumbnail(courseId);
    if (!resDelete.error) {
      const res = await mutateCreateThumbnail({ body: formData, courseId });
      if (!res.error) {
        toast.success("تصویر با موفقیت ایجاد شد");
        setIsOpen(false);
        setFile(null);
        setFileError(null);
      }
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ایجاد تصویر جدید">
      <div className={cn("flex flex-col gap-0 py-4 px-[40px]")}>
        {/* File Upload Zone */}
        <Field>
          <FieldLabel>تصویر</FieldLabel>
          {!file ? (
            <div
              className={cn(
                "relative flex flex-col items-center justify-center w-full",
                "border-2 border-dashed rounded-[16px] p-8",
                "transition-colors duration-200",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 bg-gray-50",
                "hover:border-primary/50 hover:bg-gray-100/50",
                "cursor-pointer",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold text-primary">
                  برای آپلود کلیک کنید
                </span>{" "}
                یا فایل را بکشید و رها کنید
              </p>
              <p className="text-xs text-gray-400 mt-2">
                فقط فایل‌های تصویری (JPG, PNG, GIF, WebP) (حداکثر ۲ مگابایت)
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center gap-4 p-4 border rounded-[16px]",
                "bg-gray-50",
              )}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {getFileTypeLabel(file.type)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}
          {fileError && (
            <InputMessage className="text-red-500">{fileError}</InputMessage>
          )}
        </Field>

        <div className={cn("flex justify-end gap-1 pt-2")}>
          <Button
            variant={"primary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
            onClick={handleSubmit}
          >
            ایجاد
          </Button>

          <Button
            variant={"secondary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
            onClick={() => setIsOpen(false)}
          >
            انصراف
          </Button>
        </div>
      </div>
    </Modal>
  );
}
