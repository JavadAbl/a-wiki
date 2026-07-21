import { useNavigate, useParams } from "react-router";
import {
  useContentDeleteMutation,
  useContentUpdateMutation,
  useCourseGetByIdQuery,
  useDocumentDeleteMutation,
  usePartDeleteMutation,
  usePartUpdateMutation,
  useSectionDeleteMutation,
  useSectionUpdateMutation,
} from "../../../../features/course/course-api";
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
  Layers,
  FileIcon,
  ChevronLeft,
  X,
  ImagePlayIcon,
} from "lucide-react";
import SectionCreate from "./section-create";
import { useState } from "react";
import PartCreate from "./part-create";
import ContentCreate from "./content-create";
import DocumentCreate from "./document-create";
import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";
import { ConfirmModal } from "#components/modals/confirm-modal";
import type { ContentDto } from "../../../../features/course/dto/content.dto";
import AdminCourseContentItem from "./admin-course-content-item";
import AdminCoursePartItem from "./admin-course-part-item";
import type { PartDto } from "../../../../features/course/dto/part.dto";
import type { SectionDto } from "../../../../features/course/dto/section.dto";
import AdminCourseSectionItem from "./admin-course-section-item";
import type { DocumentDto } from "../../../../features/course/dto/document.dto";
import ThumbnailCreate from "./thumbnail-create";

export default function AdminCourse() {
  const nav = useNavigate();
  const { id } = useParams();
  const [modalKeys, setModalsKey] = useState(0);

  // به جای ذخیره کل آبجکت، فقط ID را ذخیره می‌کنیم
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null,
  );
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentDto | null>(
    null,
  );
  const [selectedDocument, setSelectedDocument] = useState<DocumentDto | null>(
    null,
  );

  //Modals States
  const [isOpenSectionCreate, setIsOpenSectionCreate] = useState(false);
  const [isOpenPartCreate, setIsOpenPartCreate] = useState(false);
  const [isOpenContentCreate, setIsOpenContentCreate] = useState(false);
  const [isOpenDocumentCreate, setIsOpenDocumentCreate] = useState(false);
  const [isOpenThumbnailCreate, setIsOpenThumbnailCreate] = useState(false);

  const [isOpenSectionDeleteConfirm, setIsOpenSectionDeleteConfirm] =
    useState(false);
  const [isOpenPartDeleteConfirm, setIsOpenPartDeleteConfirm] = useState(false);
  const [isOpenContentDeleteConfirm, setIsOpenContentDeleteConfirm] =
    useState(false);
  const [isOpenDocumentDeleteConfirm, setIsOpenDocumentDeleteConfirm] =
    useState(false);

  //Data Hooks
  const {
    data: course,
    isLoading,
    isError,
  } = useCourseGetByIdQuery(id ?? skipToken);

  const [mutateSectionUpdate, { isLoading: isLoadingSectionUpdate }] =
    useSectionUpdateMutation();
  const [mutatePartUpdate, { isLoading: isLoadingPartUpdate }] =
    usePartUpdateMutation();
  const [mutateContentUpdate, { isLoading: isLoadingContentUpdate }] =
    useContentUpdateMutation();
  const [mutateSectionDelete, { isLoading: isLoadingSectionDelete }] =
    useSectionDeleteMutation();
  const [mutatePartDelete, { isLoading: isLoadingPartDelete }] =
    usePartDeleteMutation();
  const [mutateContentDelete, { isLoading: isLoadingContentDelete }] =
    useContentDeleteMutation();
  const [mutateDocumentDelete, { isLoading: isLoadingDocumentDelete }] =
    useDocumentDeleteMutation();

  // حذف State های اضافی و useEffect ها
  // مشتق کردن مستقیم داده‌ها از دیتای آپدیت شده RTK Query
  const sections: SectionDto[] = [...(course?.sections ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  const selectedSection: SectionDto | null =
    sections.find((s) => s.id === selectedSectionId) || null;

  const parts: PartDto[] = [...(selectedSection?.parts ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  const selectedPart: PartDto | null =
    parts.find((p) => p.id === selectedPartId) || null;

  const contents: ContentDto[] = [...(selectedPart?.contents ?? [])].sort(
    (a, b) => a.order - b.order,
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

  const handleSectionSetOrder = async (sectionId: number, order: number) => {
    await mutateSectionUpdate({ sectionId, body: { order } });
  };

  const handlePartSetOrder = async (partId: number, order: number) => {
    await mutatePartUpdate({ partId, body: { order } });
  };

  const handleContentSetOrder = async (contentId: number, order: number) => {
    await mutateContentUpdate({ contentId, body: { order } });
  };

  const handleSectionDelete = async (id: number | undefined) => {
    if (!id) return;
    const res = await mutateSectionDelete(id);
    if (!res.error) {
      setIsOpenSectionDeleteConfirm(false);
      setSelectedSectionId(null);
    }
  };

  const handlePartDelete = async (id: number | undefined) => {
    if (!id) return;
    const res = await mutatePartDelete(id);
    if (!res.error) {
      setIsOpenPartDeleteConfirm(false);
      setSelectedPartId(null);
    }
  };

  const handleContentDelete = async (id: number | undefined) => {
    if (!id) return;
    const res = await mutateContentDelete(id);
    if (!res.error) {
      setIsOpenContentDeleteConfirm(false);
      setSelectedContent(null);
    }
  };

  const handleDocumentDelete = async (id: number | undefined) => {
    if (!id) return;
    const res = await mutateDocumentDelete(id);
    if (!res.error) {
      setIsOpenDocumentDeleteConfirm(false);
      setSelectedDocument(null);
    }
  };

  return (
    <TooltipProvider>
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
        sectionId={selectedSection?.id ?? 0}
        isOpen={isOpenPartCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenPartCreate(open);
          increaseModalsKey();
        }}
      />

      <ContentCreate
        key={`ContentCreate_${modalKeys}`}
        partId={selectedPart?.id ?? 0}
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

      <ThumbnailCreate
        key={`ThumbnailCreate_${modalKeys}`}
        courseId={Number(id)}
        isOpen={isOpenThumbnailCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenThumbnailCreate(open);
          increaseModalsKey();
        }}
      />

      <ConfirmModal
        open={isOpenSectionDeleteConfirm}
        title="حذف بخش"
        loading={isLoadingSectionDelete}
        onOpenChange={setIsOpenSectionDeleteConfirm}
        destructive
        description={`آیا مایل به حذف بخش ${selectedSection?.title} هستید؟`}
        onConfirm={() => handleSectionDelete(selectedSection?.id)}
      />

      <ConfirmModal
        open={isOpenPartDeleteConfirm}
        title="حذف قسمت"
        loading={isLoadingPartDelete}
        onOpenChange={setIsOpenPartDeleteConfirm}
        destructive
        description={`آیا مایل به حذف قسمت ${selectedPart?.title} هستید؟`}
        onConfirm={() => handlePartDelete(selectedPart?.id)}
      />

      <ConfirmModal
        open={isOpenContentDeleteConfirm}
        title="حذف محتوا"
        loading={isLoadingContentDelete}
        onOpenChange={setIsOpenContentDeleteConfirm}
        destructive
        description={`آیا مایل به حذف محتوای ${selectedContent?.title} هستید؟`}
        onConfirm={() => handleContentDelete(selectedContent?.id)}
      />

      <ConfirmModal
        open={isOpenDocumentDeleteConfirm}
        title="حذف سند"
        loading={isLoadingDocumentDelete}
        onOpenChange={setIsOpenDocumentDeleteConfirm}
        destructive
        description={`آیا مایل به حذف سند ${selectedDocument?.title} هستید؟`}
        onConfirm={() => handleDocumentDelete(selectedDocument?.id)}
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
                <h1 className="text-xl font-bold tracking-tight">
                  {course.title}
                </h1>
                {course.isPublished ? (
                  <Badge
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-xs px-1.5 py-0"
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
                  {course.description}
                </p>
              )}
            </div>
            {course.thumbnailUrl && (
              <div className="hidden sm:block shrink-0">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-20 w-36 object-cover rounded-lg border shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="mt-0 flex items-center gap-4">
            {course.lecturer && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{course.lecturer}</span>
              </div>
            )}
            {course.lecturerProfession && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
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
                    {sections.length}
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

              <div className="max-h-100 flex flex-col gap-2 ml-3 pl-12 overflow-y-auto">
                {sections.map((section) => (
                  <AdminCourseSectionItem
                    key={`Sections_${section.id}`}
                    section={section}
                    onDelete={() => {
                      setSelectedSectionId(section.id);
                      setIsOpenSectionDeleteConfirm(true);
                    }}
                    onAcceptOrder={handleSectionSetOrder}
                    onSelect={(section) => setSelectedSectionId(section.id)}
                    isSelected={section.id === selectedSectionId}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* سطح قسمت‌ها */}
            <div
              className={cn(
                "space-y-3 py-5 transition-all duration-300",
                selectedSection
                  ? "opacity-100"
                  : "opacity-40 pointer-events-none",
              )}
            >
              <div className="flex items-center gap-3 ml-3">
                <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                  <FolderTree className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-sm font-semibold">قسمت‌ها</span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {parts.length}
                </Badge>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setIsOpenPartCreate(true)}
                  disabled={!selectedSection}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  افزودن قسمت
                </Button>
              </div>

              <div className="max-h-100 flex flex-col gap-2 ml-3 pl-12 overflow-y-auto">
                {parts.map((part) => (
                  <AdminCoursePartItem
                    key={`Parts_${part.id}`}
                    part={part}
                    onDelete={() => {
                      setSelectedPartId(part.id);
                      setIsOpenPartDeleteConfirm(true);
                    }}
                    onAcceptOrder={handlePartSetOrder}
                    onSelect={(part) => setSelectedPartId(part.id)}
                    isSelected={part.id === selectedPartId}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* سطح محتواها */}
            <div
              className={cn(
                "space-y-3 py-5 transition-all duration-300",
                selectedPart ? "opacity-100" : "opacity-40 pointer-events-none",
              )}
            >
              <div className="flex items-center gap-3 ml-3">
                <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-semibold">محتواها</span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {contents.length}
                </Badge>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setIsOpenContentCreate(true)}
                  disabled={!selectedPart}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  افزودن محتوا
                </Button>
              </div>

              <div className="max-h-100 flex flex-col gap-2 ml-3 pl-12 overflow-y-auto">
                {contents.map((content) => (
                  <AdminCourseContentItem
                    key={`Contents_${content.id}`}
                    content={content}
                    onDelete={() => {
                      setSelectedContent(content);
                      setIsOpenContentDeleteConfirm(true);
                    }}
                    onAcceptOrder={handleContentSetOrder}
                  />
                ))}
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
                      {/* Added text-right to fix RTL alignment */}
                      <TableHead className="text-right">عنوان</TableHead>

                      {/* Added text-right to fix RTL alignment */}
                      <TableHead className="hidden md:table-cell max-w-[300px] text-right">
                        توضیحات
                      </TableHead>

                      <TableHead className="w-[80px] text-left md:text-right">
                        عملیات
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {course.documents.map((doc, index) => (
                      <TableRow key={`Docs_${index}`} className="group">
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <File className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-sm">
                              {doc.title}
                            </span>
                          </div>
                        </TableCell>

                        {/* ✅ Added max-w-[300px] to match the header's width constraint */}
                        <TableCell className="hidden md:table-cell align-middle max-w-[300px]">
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {doc.description || "—"}
                          </span>
                        </TableCell>

                        {/* ✅ Added w-[80px] to match the header's width constraint */}
                        <TableCell className="text-left md:text-right align-middle w-[80px]">
                          <Tooltip>
                            <TooltipTrigger>
                              <button
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setIsOpenDocumentDeleteConfirm(true);
                                }}
                                className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer hover:bg-destructive/25 rounded-full p-1 shrink-0 ml-1"
                                aria-label="Remove"
                              >
                                <X size={14} className="text-destructive" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>حذف کردن سند</p>
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

        {/* بخش تصویر */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ImagePlayIcon className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
                </div>

                <div>
                  <CardTitle className="text-lg">عکس</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    عکس پیش نمایش دوره
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setIsOpenThumbnailCreate(true)}
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                افزودن عکس
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {course.documents && course.documents.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <div></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileIcon className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  هنوز عکسی وجود ندارد
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsOpenThumbnailCreate(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  آپلود عکس
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
