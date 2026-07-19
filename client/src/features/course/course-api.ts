import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../base-api";
import type { GetManyQuery, GetManyReply } from "../../utils/types";
import type { CategoryCreateDto } from "./schemas/category-create-schema";
import type { CategoryDto } from "./dto/category.dto";
import type { CourseDto } from "./dto/course.dto";
import type { CourseCreateDto } from "./schemas/course-create-schema";
import type { CourseDetailsDto } from "./dto/course.details.dto";
import type { SectionCreateDto } from "./schemas/section-create-schema";
import type { PartCreateDto } from "./schemas/part-create-schema";
import type { CategoryUpdateDto } from "./schemas/category-update-schema";
import type { ContentUpdateDto } from "./schemas/content-update-schema";
import type { PartUpdateDto } from "./schemas/part-update-schema";
import type { SectionUpdateDto } from "./schemas/section-update-schema";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: baseApi,
  tagTypes: ["category", "course"],

  endpoints: (builder) => ({
    //Category-----------------------------------------------------
    CategoryCreate: builder.mutation<number, CategoryCreateDto>({
      query: (body) => ({
        url: "Categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["category"],
    }),

    CategoryUpdate: builder.mutation<
      void,
      { body: CategoryUpdateDto; categoryId: number }
    >({
      query: ({ body, categoryId }) => ({
        url: `Categories/${categoryId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["category"],
    }),

    CategoryDeleteById: builder.mutation<void, number>({
      query: (id) => ({
        url: `Categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["category"],
    }),

    CategoryGetMany: builder.query<
      GetManyReply<CategoryDto>,
      GetManyQuery | void
    >({
      query: (params) => ({
        url: "Categories",
        params: params ?? undefined,
      }),
      providesTags: ["category"],
    }),

    //Course-----------------------------------------------------
    CoursesGetMany: builder.query<
      GetManyReply<CourseDto>,
      (GetManyQuery & { categoryId?: number }) | void
    >({
      query: (params) => ({
        url: "Courses",
        params: params ?? undefined,
      }),
      providesTags: ["course"],
    }),

    CoursesGetManyAdmin: builder.query<
      GetManyReply<CourseDto>,
      (GetManyQuery & { categoryId?: number }) | void
    >({
      query: (params) => ({
        url: "Courses/Admin/GetMany",
        params: params ?? undefined,
      }),
      providesTags: ["course"],
    }),

    CourseGetById: builder.query<CourseDetailsDto, number | string>({
      query: (id) => ({
        url: `Courses/${id}`,
      }),
      providesTags: ["course"],
    }),

    CourseCreate: builder.mutation<number, CourseCreateDto>({
      query: (body) => ({
        url: "Courses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["course"],
    }),

    CourseSetPublished: builder.mutation<
      void,
      { body: { isPublished: boolean }; courseId: number }
    >({
      query: ({ body, courseId }) => ({
        url: `Courses/${courseId}/SetPublished`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["course"],
    }),

    //Section-------------------------------------------------------
    SectionCreate: builder.mutation<
      number,
      { body: SectionCreateDto; courseId: number }
    >({
      query: ({ body, courseId }) => ({
        url: `Courses/${courseId}/Sections`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["course"],
    }),

    SectionUpdate: builder.mutation<
      number,
      { body: SectionUpdateDto; sectionId: number }
    >({
      query: ({ body, sectionId }) => ({
        url: `Courses/Sections/${sectionId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["course"],
    }),

    SectionDelete: builder.mutation<void, number>({
      query: (sectionId) => ({
        url: `Courses/Sections/${sectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["course"],
    }),

    //Part-------------------------------------------------------
    PartCreate: builder.mutation<
      number,
      { body: PartCreateDto; sectionId: number }
    >({
      query: ({ body, sectionId }) => ({
        url: `Courses/Sections/${sectionId}/Parts`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["course"],
    }),

    PartUpdate: builder.mutation<
      number,
      { body: PartUpdateDto; partId: number }
    >({
      query: ({ body, partId }) => ({
        url: `Courses/Parts/${partId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["course"],
    }),

    PartDelete: builder.mutation<void, number>({
      query: (partId) => ({
        url: `Courses/Parts/${partId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["course"],
    }),

    //Content-------------------------------------------------------
    ContentCreate: builder.mutation<number, { body: FormData; partId: number }>(
      {
        query: ({ body, partId }) => ({
          url: `Courses/Parts/${partId}/Contents`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["course"],
      },
    ),

    ContentUpdate: builder.mutation<
      number,
      { body: ContentUpdateDto; contentId: number }
    >({
      query: ({ body, contentId }) => ({
        url: `Courses/Contents/${contentId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["course"],
    }),

    ContentDelete: builder.mutation<void, number>({
      query: (contentId) => ({
        url: `Courses/Contents/${contentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["course"],
    }),

    ContentGetURLById: builder.query<{ url: string }, number>({
      query: (contentId) => ({
        url: `Courses/Contents/${contentId}/URL`,
      }),
      keepUnusedDataFor: 0,
    }),

    //Document-------------------------------------------------------
    DocumentCreate: builder.mutation<
      number,
      { body: FormData; courseId: number }
    >({
      query: ({ body, courseId }) => ({
        url: `Courses/${courseId}/Documents`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["course"],
    }),
  }),
});

export const {
  useCategoryGetManyQuery,
  useCategoryCreateMutation,
  useCoursesGetManyQuery,
  useCourseCreateMutation,
  useCourseGetByIdQuery,
  useSectionCreateMutation,
  usePartCreateMutation,
  useContentCreateMutation,
  useDocumentCreateMutation,
  useCourseSetPublishedMutation,
  useCoursesGetManyAdminQuery,
  useCategoryDeleteByIdMutation,
  useCategoryUpdateMutation,
  useContentGetURLByIdQuery,
  useContentDeleteMutation,
  useContentUpdateMutation,
  usePartUpdateMutation,
  useSectionUpdateMutation,
  usePartDeleteMutation,
  useSectionDeleteMutation,
} = courseApi;
