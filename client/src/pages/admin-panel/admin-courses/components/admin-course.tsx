import { useNavigate, useParams } from "react-router";
import { useCourseGetByIdQuery } from "../../../../features/course/course-api";
import { skipToken } from "@reduxjs/toolkit/query";
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card";
import { Badge } from "#components/ui/badge";
import { Separator } from "#components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#components/ui/tooltip";
import {
  BookOpen,
  User,
  Briefcase,
  CheckCircle2,
  XCircle,
  Folder,
  FolderTree,
  FileText,
  File,
  Plus,
  ExternalLink,
  Layers,
  FileIcon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import SectionCreate from "./section-create";
import { useState } from "react";
import PartCreate from "./part-create";
import ContentCreate from "./content-create";
import DocumentCreate from "./document-create";
import { Button } from "#components/ui/button";
import Select from "react-select";
import { cn } from "#lib/utils";
import { reactSelectStyles } from "../../../../utils/react-select-styles";

// تعریف نوع گزینه‌ها برای react-select
type OptionType = { value: number; label: string };

export default function AdminCourse() {
  const nav = useNavigate();
  const { id } = useParams();
  const [isOpenSectionCreate, setIsOpenSectionCreate] = useState(false);
  const [isOpenPartCreate, setIsOpenPartCreate] = useState(false);
  const [isOpenContentCreate, setIsOpenContentCreate] = useState(false);
  const [isOpenDocumentCreate, setIsOpenDocumentCreate] = useState(false);
  const [modalKeys, setModalsKey] = useState(0);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null,
  );
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(
    null,
  );

  const {
    data: course,
    isLoading,
    isError,
  } = useCourseGetByIdQuery(id ?? skipToken);

  // وضعیت مشتق شده برای سلسله‌مراتب انتخاب شده
  const selectedSection = course?.sections?.find(
    (s) => s.id === selectedSectionId,
  );
  const selectedPart = selectedSection?.parts?.find(
    (p) => p.id === selectedPartId,
  );

  // ساخت گزینه‌ها برای react-select
  const sectionOptions: OptionType[] = course?.sections
    ? [...course.sections]
        .sort((a, b) => a.sectionOrder - b.sectionOrder)
        .map((s) => ({ value: s.id, label: s.title }))
    : [];

  const partOptions: OptionType[] = selectedSection?.parts
    ? [...selectedSection.parts]
        .sort((a, b) => a.partOrder - b.partOrder)
        .map((p) => ({ value: p.id, label: p.title }))
    : [];
  console.log(selectedPart?.contents);

  const contentOptions: OptionType[] = selectedPart?.contents
    ? [...selectedPart.contents]
        .sort((a, b) => a.contentOrder - b.contentOrder)
        .map((c) => ({ value: c.id, label: c.title }))
    : [];

  // کمک‌گیرنده برای دریافت گزینه انتخاب شده فعلی
  const selectedSectionOption = sectionOptions.find(
    (opt) => opt.value === selectedSectionId,
  );
  const selectedPartOption = partOptions.find(
    (opt) => opt.value === selectedPartId,
  );

  const selectedContentOption = contentOptions.find(
    (opt) => opt.value === selectedContentId,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] ">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <BookOpen className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">در حال بارگذاری دوره</p>
            <p className="text-xs text-muted-foreground mt-1">
              لطفاً چند لحظه صبر کنید...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">دوره یافت نشد</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                دوره‌ای که به دنبال آن هستید وجود ندارد یا به آن دسترسی ندارید.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const increaseModalsKey = () => {
    setModalsKey((val) => val + 1);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <SectionCreate
        key={`SectionCreate_${modalKeys}`}
        courseId={Number(id)}
        isOpen={isOpenSectionCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenSectionCreate(open);
          increaseModalsKey();
        }}
      />

      <PartCreate
        key={`PartCreate_${modalKeys}`}
        sectionId={Number(selectedSectionId)}
        isOpen={isOpenPartCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenPartCreate(open);
          increaseModalsKey();
        }}
      />

      <ContentCreate
        key={`ContentCreate_${modalKeys}`}
        partId={Number(selectedPartId)}
        isOpen={isOpenContentCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenContentCreate(open);
          increaseModalsKey();
        }}
      />

      <DocumentCreate
        key={`DocumentCreate_${modalKeys}`}
        courseId={Number(id)}
        isOpen={isOpenDocumentCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenDocumentCreate(open);
          increaseModalsKey();
        }}
      />

      <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto bg-surface-300">
        {/* کارت هدر */}
        <Card className="overflow-hidden shadow-sm bg-surface-200 p-4 gap-1">
          <div className="flex items-center justify-between gap-1.5 text-xs text-muted-foreground mb-1.5">
            <div className={cn("flex items-center")}>
              <BookOpen className="h-3.5 w-3.5" />
              <span>جزئیات دوره</span>
            </div>

            <Button variant={"link"} onClick={() => nav("/Admin/Courses")}>
              {"بازگشت"}
              <ChevronLeft />
            </Button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Reduced gap */}
                <h1 className="text-xl font-bold tracking-tight">
                  {/* Reduced text from 3xl to xl */}
                  {course.title}
                </h1>
                {course.isPublished ? (
                  <Badge
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-xs px-1.5 py-0" /* Made badge smaller */
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    منتشر شده
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    <XCircle className="h-3 w-3 mr-1" />
                    پیش‌نویس
                  </Badge>
                )}
              </div>
              {course.description && (
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2 max-w-3xl">
                  {/* Reduced margin, size, and added line-clamp */}
                  {course.description}
                </p>
              )}
            </div>
            {course.thumbnailUrl && (
              <div className="hidden sm:block shrink-0">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-20 w-36 object-cover rounded-lg border shadow-sm" /* Reduced image height and width */
                />
              </div>
            )}
          </div>

          <div className="mt-0 flex items-center gap-4">
            {/* Changed to flex-row to stack horizontally instead of vertically */}
            {course.lecturer && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{course.lecturer}</span>
                {/* Reduced size */}
              </div>
            )}
            {course.lecturerProfession && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {/* Reduced size */}
                  {course.lecturerProfession}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* سلسله‌مراتب محتوا */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="h-[18px] w-[18px] text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">ساختار محتوا</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    پیمایش و مدیریت سلسله‌مراتب دوره
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-0">
            {/* سطح بخش‌ها */}
            <div className="space-y-3 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                    <Folder className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold">بخش‌ها</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {sectionOptions.length}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setIsOpenSectionCreate(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  افزودن بخش
                </Button>
              </div>
              <Select
                styles={reactSelectStyles}
                className="w-full sm:w-[380px]"
                options={sectionOptions}
                value={selectedSectionOption}
                onChange={(option) => {
                  const opt = option as OptionType | null;
                  setSelectedSectionId(opt?.value ?? null);
                  setSelectedPartId(null);
                }}
                placeholder="یک بخش را برای مدیریت قسمت‌ها انتخاب کنید..."
                isDisabled={sectionOptions.length === 0}
                isClearable={false}
              />
            </div>

            <Separator />

            {/* سطح قسمت‌ها */}
            <div
              className={cn(
                "space-y-3 py-5 transition-all duration-300",
                selectedSectionId
                  ? "opacity-100"
                  : "opacity-40 pointer-events-none",
              )}
            >
              <div className="flex items-center gap-3 ml-3">
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                  <FolderTree className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-sm font-semibold">قسمت‌ها</span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {partOptions.length}
                </Badge>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setIsOpenPartCreate(true)}
                  disabled={!selectedSectionId}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  افزودن قسمت
                </Button>
              </div>
              <div className="ml-3 pl-7">
                <Select
                  styles={reactSelectStyles}
                  className="w-full sm:w-[350px]"
                  options={partOptions}
                  value={selectedPartOption}
                  onChange={(option) => {
                    const opt = option as OptionType | null;
                    setSelectedPartId(opt?.value ?? null);
                  }}
                  placeholder={
                    selectedSectionId
                      ? "یک قسمت را برای مدیریت محتواها انتخاب کنید..."
                      : "ابتدا یک بخش را انتخاب کنید"
                  }
                  isDisabled={partOptions.length === 0 || !selectedSectionId}
                  isClearable={false}
                />
              </div>
            </div>

            <Separator />

            {/* سطح محتواها */}
            <div
              className={cn(
                "space-y-3 py-5 transition-all duration-300",
                selectedPartId
                  ? "opacity-100"
                  : "opacity-40 pointer-events-none",
              )}
            >
              <div className="flex items-center gap-3 ml-3">
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 -ml-1" />
                <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-semibold">محتواها</span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {contentOptions.length}
                </Badge>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setIsOpenContentCreate(true)}
                  disabled={!selectedPartId}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  افزودن محتوا
                </Button>
              </div>

              <div className="ml-3 pl-[52px]">
                <Select
                  // styles={reactSelectStyles}
                  className="w-full sm:w-[320px]"
                  options={contentOptions}
                  value={null}
                  placeholder={
                    selectedPartId
                      ? "یک محتوا را برای مشاهده جزئیات انتخاب کنید..."
                      : "ابتدا یک قسمت را انتخاب کنید"
                  }
                  isDisabled={contentOptions.length === 0 || !selectedPartId}
                  isClearable={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* بخش اسناد */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FileIcon className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">اسناد</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    مواد و منابع دوره
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setIsOpenDocumentCreate(true)}
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                افزودن سند
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {course.documents && course.documents.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>عنوان</TableHead>
                      <TableHead className="hidden md:table-cell max-w-[300px]">
                        توضیحات
                      </TableHead>
                      <TableHead className="w-[80px] text-right">
                        عملیات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.documents.map((doc, index) => (
                      <TableRow key={doc.id} className="group">
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {String(index + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <File className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-sm">
                              {doc.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {doc.description || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity"
                              >
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>باز کردن سند</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileIcon className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  هنوز سندی وجود ندارد
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  مواد و منابع دوره را برای دانشجویان اضافه کنید
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsOpenDocumentCreate(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  آپلود سند
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
