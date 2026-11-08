import { useRef, useState } from "react";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { Badge } from "#components/ui/badge";
import { Spinner } from "#components/ui/spinner";
import { DataGrid } from "#components/grids/data-grid";
import { Field, FieldLabel } from "#components/ui/field";
import { InputMessage } from "#components/inputs/input-message";
import { cn } from "#lib/utils";
import { FileSpreadsheet, FileWarning, Upload, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  useLazyUserBatchTemplateQuery,
  useUserBatchCreateMutation,
} from "../../../../features/user/user-api";
import type {
  UserBatchResult,
  UserBatchRowResult,
} from "../../../../features/user/dto/user-batch-result.dto";
import { toPersianNum } from "../../../../utils/app-utils";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

const columns: ColumnDef<UserBatchRowResult>[] = [
  {
    id: "row",
    header: "ردیف",
    size: 70,
    cell: ({ row }) => toPersianNum(row.original.row),
  },
  { id: "firstName", header: "نام", cell: ({ row }) => row.original.firstName },
  {
    id: "lastName",
    header: "نام خانوادگی",
    cell: ({ row }) => row.original.lastName,
  },
  {
    id: "nationalCode",
    header: "کدملی",
    cell: ({ row }) => row.original.nationalCode,
  },
  {
    id: "mobile",
    header: "موبایل",
    cell: ({ row }) => row.original.mobile ?? "-",
  },
  {
    id: "status",
    header: "وضعیت",
    size: 90,
    cell: ({ row }) => (
      <Badge
        className="font-normal"
        variant={row.original.status === "success" ? "default" : "secondary"}
      >
        {row.original.status === "success" ? "موفق" : "ناموفق"}
      </Badge>
    ),
  },
  {
    id: "message",
    header: "توضیح",
    cell: ({ row }) => (
      <span
        className={cn(
          row.original.status === "failed" && "text-destructive",
        )}
        title={row.original.message}
      >
        {row.original.message ?? "-"}
      </span>
    ),
  },
];

export default function UserBatchCreate({ isOpen, setIsOpen }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [result, setResult] = useState<UserBatchResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fetchTemplate, { isFetching: isTemplateFetching }] =
    useLazyUserBatchTemplateQuery();
  const [mutateBatchCreate, { isLoading }] = useUserBatchCreateMutation();

  const reset = () => {
    setFile(null);
    setFileError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const close = () => {
    setIsOpen(false);
    reset();
  };

  const handleDownloadTemplate = async () => {
    const res = await fetchTemplate();
    if (res.data) downloadBlob(res.data, "users-template.xlsx");
  };

  const handleDownloadErrors = () => {
    if (!result?.errorFileBase64) return;
    downloadBlob(
      base64ToBlob(
        result.errorFileBase64,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ),
      "users-errors.xlsx",
    );
  };

  const validateFile = (selectedFile: File): boolean => {
    if (!/\.xlsx$/i.test(selectedFile.name)) {
      setFileError("فقط فایل اکسل با پسوند xlsx مجاز است");
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError("حجم فایل نباید بیشتر از ۲ مگابایت باشد");
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
    setFile(validateFile(selectedFile) ? selectedFile : null);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("لطفاً یک فایل اکسل انتخاب کنید");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    const res = await mutateBatchCreate({ body: formData });
    if (res.data) setResult(res.data);
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => (open ? setIsOpen(true) : close())}
      title="افزودن گروهی کاربران"
      isLock={isLoading}
      className="max-w-[900px]"
    >
      <div className={cn("flex flex-col gap-0 py-4 px-[40px]")}>
        {!result ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <p className="text-xs text-muted-foreground">
                ابتدا قالب اکسل را دریافت کنید، اطلاعات کاربران را در آن وارد
                کنید و سپس فایل را بارگذاری نمایید.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isTemplateFetching}
                onClick={handleDownloadTemplate}
              >
                <FileSpreadsheet />
                دانلود قالب اکسل
              </Button>
            </div>

            <Field>
              <FieldLabel>فایل اکسل</FieldLabel>
              {!file ? (
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center w-full",
                    "border-2 border-dashed rounded-[16px] p-8",
                    "transition-colors duration-200 cursor-pointer",
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 bg-gray-50",
                    "hover:border-primary/50 hover:bg-gray-100/50",
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-semibold text-primary">
                      برای انتخاب فایل کلیک کنید
                    </span>{" "}
                    یا فایل را بکشید و رها کنید
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    فقط فایل اکسل (xlsx) — حداکثر ۲ مگابایت
                  </p>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 border rounded-[16px] bg-gray-50",
                  )}
                >
                  <FileSpreadsheet className="w-8 h-8 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate max-w-125">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
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

            <div className={cn("flex justify-end gap-1 pt-4")}>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className={cn("self-end rounded-[24px] min-w-[75px]")}
                isLoading={isLoading}
                disabled={!file}
                onClick={handleSubmit}
              >
                بارگذاری و ایجاد
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                className={cn("self-end rounded-[24px] min-w-[75px]")}
                onClick={close}
              >
                انصراف
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 pb-3">
              <Badge variant="secondary" className="font-normal">
                کل: {toPersianNum(result.totalRows)}
              </Badge>
              <Badge variant="default" className="font-normal">
                موفق: {toPersianNum(result.successCount)}
              </Badge>
              <Badge
                variant={result.failureCount > 0 ? "destructive" : "secondary"}
                className="font-normal"
              >
                ناموفق: {toPersianNum(result.failureCount)}
              </Badge>

              {result.failureCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ms-auto"
                  onClick={handleDownloadErrors}
                >
                  <FileWarning />
                  دانلود فایل خطاها
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground pb-2">
              {result.failureCount > 0
                ? `از ${toPersianNum(
                    result.totalRows,
                  )} ردیف ارسال‌شده، ${toPersianNum(
                    result.successCount,
                  )} کاربر ایجاد شد. ردیف‌های ناموفق همراه با دلیل خطا در فایل قابل دانلود هستند؛ آن‌ها را اصلاح کرده و مجدداً بارگذاری کنید.`
                : "همه کاربران با موفقیت ایجاد شدند."}
            </p>

            <DataGrid
              mode="client"
              data={result.results}
              columns={columns}
              initialPageSize={10}
              className="h-[340px]"
              alignLastEnd
            />

            <div className={cn("flex justify-end gap-1 pt-4")}>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className={cn("self-end rounded-[24px] min-w-[75px]")}
                onClick={reset}
              >
                بارگذاری فایل دیگر
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                className={cn("self-end rounded-[24px] min-w-[75px]")}
                onClick={close}
              >
                بستن
              </Button>
            </div>
          </>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Spinner />
            در حال پردازش فایل...
          </div>
        )}
      </div>
    </Modal>
  );
}
