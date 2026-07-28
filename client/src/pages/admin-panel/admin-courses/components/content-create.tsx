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
import { useContentCreateMutation } from "../../../../features/course/course-api";
import { useState, useCallback, useRef } from "react";
import { Upload, X, FileVideo, FileAudio } from "lucide-react";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
  partId: number;
}

const ALLOWED_TYPES = ["video/", "audio/"];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export default function ContentCreate({ isOpen, setIsOpen, partId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // 1. Add progress state
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ContentCreateDto>({
    resolver: zodResolver(ContentCreateSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const [mutateCreateContent, { isLoading }] = useContentCreateMutation();

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
    if (droppedFile) handleFileSelect(droppedFile);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type.startsWith("video/"))
      return <FileVideo className="w-8 h-8 text-blue-500" />;
    if (file.type.startsWith("audio/"))
      return <FileAudio className="w-8 h-8 text-purple-500" />;
    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  async function handleSubmit(data: ContentCreateDto) {
    if (!file) {
      toast.error("لطفاً یک فایل ویدئویی یا صوتی انتخاب کنید");
      return;
    }

    const formData = new FormData();
    formData.set("title", data.title);
    if (data?.description) formData.set("description", data.description);
    formData.set("file", file);

    try {
      // 2. Pass the onUploadProgress callback to the mutation
      await mutateCreateContent({
        body: formData,
        partId,
        onUploadProgress: (percent) => setUploadProgress(percent),
      }).unwrap(); // .unwrap() allows us to use try/catch cleanly

      toast.success("محتوا با موفقیت ایجاد شد");
      setIsOpen(false);
      form.reset();
      setFile(null);
      setFileError(null);
      setUploadProgress(0); // Reset progress for next time
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(
        error?.data?.message || "خطا در آپلود فایل. لطفاً دوباره تلاش کنید.",
      );
      setUploadProgress(0);
    }
  }

  // 3. Reset progress when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUploadProgress(0);
      setFile(null);
      setFileError(null);
      form.reset();
    }
    setIsOpen(open);
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="ایجاد محتوای جدید"
      isLock={isLoading}
    >
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-0 py-4 px-[40px]")}
      >
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
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
            <Field data-invalid={fieldState.invalid}>
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
                  "focus-visible:outline-none focus-visible:ring-2 ",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "resize-none",
                )}
              />
              <InputMessage>{fieldState.error?.message}</InputMessage>
            </Field>
          )}
        />

        {/* File Upload Zone */}
        <Field>
          <FieldLabel>فایل محتوا</FieldLabel>
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
                accept="video/*,audio/*"
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
                فقط فایل‌های ویدئویی و صوتی (حداکثر 500 مگابایت)
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center gap-4 p-4 border rounded-[16px]",
                "bg-gray-50",
              )}
            >
              {getFileIcon()}
              <div className="flex-1 min-w-0 overflow-hidden w-40">
                <p className="text-sm font-medium truncate max-w-full">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {file.type || "نوع فایل نامشخص"}
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
          {fileError && (
            <InputMessage className="text-red-500">{fileError}</InputMessage>
          )}
        </Field>

        {/* 4. Progress Bar UI */}
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

        <div
          className={cn(
            "flex justify-end gap-2 pt-4 mt-2 border-t border-gray-100",
          )}
        >
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
            disabled={!file || !!fileError || isLoading}
          >
            {isLoading ? `آپلود ${uploadProgress}%` : "ایجاد"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
