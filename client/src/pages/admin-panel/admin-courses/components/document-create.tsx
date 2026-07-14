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
  DocumentCreateSchema,
  type DocumentCreateDto,
} from "../../../../features/course/schemas/document-create-schema";
import { useDocumentCreateMutation } from "../../../../features/course/course-api";
import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  FileSpreadsheet,
  File,
  FileArchive,
  FileSearch,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
  courseId: number;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/csv",
  "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DocumentCreate({ isOpen, setIsOpen, courseId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DocumentCreateDto>({
    resolver: zodResolver(DocumentCreateSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const [mutateCreateDocument] = useDocumentCreateMutation();

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("حجم فایل نباید بیشتر از 10 مگابایت باشد");
      return false;
    }

    // Check file type
    const isAllowed = ALLOWED_TYPES.includes(file.type);
    if (!isAllowed) {
      setFileError("فقط فایل‌های PDF، Word، Excel و CSV مجاز هستند");
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

  const getFileIcon = () => {
    if (!file) return null;

    const type = file.type;
    if (type === "application/pdf") {
      return <FileSearch className="w-8 h-8 text-red-500" />;
    }
    if (
      type === "application/msword" ||
      type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }
    if (
      type === "application/vnd.ms-excel" ||
      type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      type === "application/vnd.ms-excel.sheet.macroEnabled.12"
    ) {
      return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    }
    if (type === "text/csv") {
      return <FileArchive className="w-8 h-8 text-yellow-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getFileTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      "application/pdf": "PDF",
      "application/msword": "Word",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "Word",
      "application/vnd.ms-excel": "Excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "Excel",
      "application/vnd.ms-excel.sheet.macroEnabled.12": "Excel",
      "text/csv": "CSV",
    };
    return typeMap[type] || "نوع فایل نامشخص";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  async function handleSubmit(data: DocumentCreateDto) {
    if (!file) {
      toast.error("لطفاً یک فایل انتخاب کنید");
      return;
    }

    const formData = new FormData();
    formData.set("title", data.title);
    if (data?.description) formData.set("description", data.description);
    formData.set("file", file);

    const res = await mutateCreateDocument({ body: formData, courseId });
    if (!res.error) {
      toast.success("محتوا با موفقیت ایجاد شد");
      setIsOpen(false);
      form.reset();
      setFile(null);
      setFileError(null);
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="ایجاد محتوای جدید">
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.xlsm,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
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
                فقط فایل‌های PDF، Word، Excel و CSV (حداکثر 10 مگابایت)
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {getFileTypeLabel(file.type)}
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
            type="submit"
            variant={"primary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
          >
            ایجاد
          </Button>

          <Button
            type="button"
            variant={"secondary"}
            size={"lg"}
            className={cn("self-end rounded-[24px] min-w-[75px]")}
            onClick={() => setIsOpen(false)}
          >
            انصراف
          </Button>
        </div>
      </form>
    </Modal>
  );
}
