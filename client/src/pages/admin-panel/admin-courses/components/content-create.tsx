import { FormInput } from "#components/inputs/input";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "#components/ui/field";
import { toast } from "sonner";
import { InputMessage } from "#components/inputs/input-message";
import {
  ContentCreateSchema,
  type ContentCreateDto,
} from "../../../../features/course/schemas/content-create-schema";
import {
  useContentCreateMutation,
  useContentCreateManyMutation, // Import the new mutation
} from "../../../../features/course/course-api";
import { useState, useCallback, useRef } from "react";
import { Upload, X, FileVideo, FileAudio } from "lucide-react";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
  partId: number;
}
const MAX_FILES = 20;
const ALLOWED_TYPES = ["video/", "audio/"];
const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 1000MB

// Helper type for many mode
interface ManyFileItem {
  id: string;
  file: File;
  title: string;
  description: string;
}

export default function ContentCreate({ isOpen, setIsOpen, partId }: Props) {
  // Single Mode State
  const [file, setFile] = useState<File | null>(null);

  // Many Mode State
  const [isManyMode, setIsManyMode] = useState(false);
  const [manyFiles, setManyFiles] = useState<ManyFileItem[]>([]);

  // Shared State
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ContentCreateDto>({
    resolver: zodResolver(ContentCreateSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const [mutateCreateContent, { isLoading: isLoadingSingle }] =
    useContentCreateMutation();
  const [mutateCreateManyContent, { isLoading: isLoadingMany }] =
    useContentCreateManyMutation();

  const isLoading = isLoadingSingle || isLoadingMany;

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setFileError("حجم فایل نباید بیشتر از 500 مگابایت باشد");
      return false;
    }
    const isAllowed = ALLOWED_TYPES.some((type) => file.type.startsWith(type));
    if (!isAllowed) {
      setFileError("فقط فایل‌های ویدئویی و صوتی مجاز هستند");
      return false;
    }
    setFileError(null);
    return true;
  };

  // --- Single Mode Handlers ---
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

  const removeFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Many Mode Handlers ---
  const handleManyFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentCount = manyFiles.length;
    const availableSlots = MAX_FILES - currentCount;

    if (availableSlots <= 0) {
      toast.error(
        `شما نمی‌توانید بیشتر از ${MAX_FILES} فایل را همزمان آپلود کنید.`,
      );
      return;
    }

    const filesArray = Array.from(files);

    // If user selects more files than allowed, truncate and notify
    if (filesArray.length > availableSlots) {
      toast.error(
        `حداکثر ${availableSlots} فایل دیگر می‌توانید اضافه کنید. فایل‌های اضافی نادیده گرفته شدند.`,
      );
    }

    const filesToProcess = filesArray.slice(0, availableSlots);
    const validFiles: ManyFileItem[] = [];
    let invalidCount = 0;

    filesToProcess.forEach((file) => {
      if (
        file.size > MAX_FILE_SIZE ||
        !ALLOWED_TYPES.some((type) => file.type.startsWith(type))
      ) {
        invalidCount++;
      } else {
        // Strip the file extension (e.g., "video.mp4" -> "video")
        // If no extension exists, it keeps the original name
        const defaultTitle = file.name.replace(/\.[^/.]+$/, "");

        validFiles.push({
          id: crypto.randomUUID(),
          file,
          title: defaultTitle,
          description: "",
        });
      }
    });

    if (invalidCount > 0) {
      toast.error(
        `${invalidCount} فایل نامعتبر بود (حجم زیاد یا فرمت اشتباه) و حذف شد.`,
      );
    }

    if (validFiles.length > 0) {
      setManyFiles((prev) => [...prev, ...validFiles]);
      setFileError(null);
    }
  };

  const updateManyItem = (
    id: string,
    key: "title" | "description",
    value: string,
  ) => {
    setManyFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const removeManyItem = (id: string) => {
    setManyFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // --- Shared Drag/Drop Handlers ---
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (isManyMode) {
        handleManyFileSelect(e.dataTransfer.files);
      } else {
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
      }
    },
    [isManyMode],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isManyMode) {
      handleManyFileSelect(e.target.files);
    } else {
      const selectedFile = e.target.files?.[0] || null;
      handleFileSelect(selectedFile);
    }
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input to allow selecting same file
  };

  const handleModeChange = (checked: boolean) => {
    setIsManyMode(checked);
    // Clear opposite mode's state when toggling
    if (checked) {
      removeFile();
    } else {
      setManyFiles([]);
    }
    setUploadProgress(0);
    setFileError(null);
  };

  // --- Submit Logic ---
  async function handleSubmitSingle(data: ContentCreateDto) {
    if (!file) {
      toast.error("لطفاً یک فایل ویدئویی یا صوتی انتخاب کنید");
      return;
    }

    const formData = new FormData();
    formData.set("title", data.title);
    if (data?.description) formData.set("description", data.description);
    formData.set("file", file);

    try {
      await mutateCreateContent({
        body: formData,
        partId,
        onUploadProgress: (percent) => setUploadProgress(percent),
      }).unwrap();

      toast.success("محتوا با موفقیت ایجاد شد");
      handleOpenChange(false);
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(
        error?.data?.message || "خطا در آپلود فایل. لطفاً دوباره تلاش کنید.",
      );
      setUploadProgress(0);
    }
  }

  async function handleSubmitMany() {
    if (manyFiles.length === 0) {
      toast.error("لطفاً حداقل یک فایل ویدئویی یا صوتی انتخاب کنید");
      return;
    }

    if (manyFiles.some((item) => !item.title.trim())) {
      toast.error("لطفاً برای همه فایل‌ها عنوان وارد کنید");
      return;
    }

    const formData = new FormData();
    manyFiles.forEach((item) => {
      formData.append("files", item.file);
      formData.append("titles", item.title);
      formData.append("descriptions", item.description);
    });

    try {
      await mutateCreateManyContent({
        body: formData,
        partId,
        onUploadProgress: (percent: number) => setUploadProgress(percent),
      }).unwrap();

      toast.success("محتواها با موفقیت ایجاد شدند");
      handleOpenChange(false);
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(
        error?.data?.message || "خطا در آپلود فایل‌ها. لطفاً دوباره تلاش کنید.",
      );
      setUploadProgress(0);
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isManyMode) {
      handleSubmitMany();
    } else {
      form.handleSubmit(handleSubmitSingle)();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUploadProgress(0);
      setFile(null);
      setManyFiles([]);
      setFileError(null);
      setIsManyMode(false);
      form.reset();
    }
    setIsOpen(open);
  };

  // --- UI Helpers ---
  const getFileIcon = (fileObj: File) => {
    if (fileObj.type.startsWith("video/"))
      return <FileVideo className="w-8 h-8 text-blue-500 flex-shrink-0" />;
    if (fileObj.type.startsWith("audio/"))
      return <FileAudio className="w-8 h-8 text-purple-500 flex-shrink-0" />;
    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="ایجاد محتوای جدید"
      isLock={isLoading}
    >
      <form
        onSubmit={handleFormSubmit}
        className={cn("flex flex-col gap-0 py-4 px-[40px]")}
      >
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-6 bg-gray-50 p-3 rounded-[16px]">
          <input
            id="many-mode"
            type="checkbox"
            checked={isManyMode}
            onChange={(e) => handleModeChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            disabled={isLoading}
          />
          <label
            htmlFor="many-mode"
            className="text-sm font-medium cursor-pointer text-gray-700"
          >
            حالت آپلود گروهی (چند فایل)
          </label>
        </div>

        {/* Single Mode Form Fields */}
        {!isManyMode && (
          <>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-4">
                  <FieldLabel htmlFor="title">عنوان محتوا</FieldLabel>
                  <FormInput
                    {...field}
                    id="title"
                    aria-invalid={fieldState.invalid}
                    placeholder="عنوان محتوا را وارد کنید"
                    autoComplete="off"
                  />
                  <InputMessage>{fieldState.error?.message}</InputMessage>
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-4">
                  <FieldLabel htmlFor="description">توضیحات</FieldLabel>
                  <textarea
                    {...field}
                    id="description"
                    aria-invalid={fieldState.invalid}
                    placeholder="توضیحات را وارد کنید (اختیاری)"
                    autoComplete="off"
                    rows={4}
                    className={cn(
                      "flex w-full rounded-[16px] border border-gray px-4 py-3 text-sm",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      "resize-none",
                    )}
                  />
                  <InputMessage>{fieldState.error?.message}</InputMessage>
                </Field>
              )}
            />
          </>
        )}

        {/* File Upload Zone (Shared) */}
        <Field className="mb-4">
          <FieldLabel>
            {isManyMode ? "فایل‌های محتوا" : "فایل محتوا"}
          </FieldLabel>

          {/* Show Dropzone if single empty OR many mode */}
          {(!isManyMode && !file) || isManyMode ? (
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
                accept="video/*,audio/*"
                multiple={isManyMode}
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold text-primary">
                  برای آپلود کلیک کنید
                </span>{" "}
                یا فایل را بکشید و رها کنید
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {isManyMode
                  ? `حداکثر ${MAX_FILES} فایل همزمان - فقط ویدئویی و صوتی (تا 500MB)`
                  : "فقط فایل‌های ویدئویی و صوتی (حداکثر 500 مگابایت)"}
              </p>
            </div>
          ) : null}

          {/* Single Mode File Preview */}
          {!isManyMode && file && (
            <div
              className={cn(
                "flex items-center gap-4 p-4 border rounded-[16px]",
                "bg-gray-50 mt-2",
              )}
            >
              {getFileIcon(file)}
              <div className="flex-1 min-w-0 overflow-hidden w-40">
                <p className="text-sm font-medium truncate max-w-full">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isLoading}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Many Mode Files List */}
          {isManyMode && manyFiles.length > 0 && (
            <div className="flex flex-col gap-3 mt-2 max-h-[300px] overflow-y-auto pr-1">
              {manyFiles.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-[16px] p-4 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(item.file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeManyItem(item.id)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="عنوان محتوا"
                      value={item.title}
                      onChange={(e) =>
                        updateManyItem(item.id, "title", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      disabled={isLoading}
                    />
                    <textarea
                      placeholder="توضیحات (اختیاری)"
                      value={item.description}
                      onChange={(e) =>
                        updateManyItem(item.id, "description", e.target.value)
                      }
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {fileError && (
            <InputMessage className="text-red-500 mt-2">
              {fileError}
            </InputMessage>
          )}
        </Field>

        {/* Progress Bar UI */}
        {isLoading && (
          <div className="mt-4 w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between text-xs text-gray-600 mb-1.5 font-medium">
              <span>در حال آپلود فایل...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-gray-100">
          <Button
            type="button"
            variant={"secondary"}
            size={"lg"}
            className={cn("rounded-[24px] min-w-[100px]")}
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant={"primary"}
            size={"lg"}
            className={cn("rounded-[24px] min-w-[100px]")}
            isLoading={isLoading}
            disabled={
              isLoading ||
              (!isManyMode ? !file || !!fileError : manyFiles.length === 0)
            }
          >
            {isLoading ? `آپلود ${uploadProgress}%` : "ایجاد"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
