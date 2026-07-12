import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../base-api";
import type { GetManyQuery, GetManyReply } from "../../utils/types";
import type { CategoryCreateDto } from "./schemas/category-create-schema";
import type { CategoryDto } from "./dto/category.dto";
import type { CourseDto } from "./dto/course.dto";

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
  }),
});

export const {
  useCategoryGetManyQuery,
  useCategoryCreateMutation,
  useCoursesGetManyQuery,
} = courseApi;
