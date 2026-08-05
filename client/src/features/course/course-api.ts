import { createApi } from "@reduxjs/toolkit/query/react";
import { BASE_ADDRESS, baseApi } from "../base-api";
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
import type { CourseUpdateDto } from "./schemas/course-update-schema";
import { refreshAccessToken } from "../../utils/refresh-token";
import type { AppState } from "../store";

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

    CourseUpdate: builder.mutation<
      number,
      { body: CourseUpdateDto; courseId: number }
    >({
      query: ({ body, courseId }) => ({
        url: `Courses/${courseId}`,
        method: "PATCH",
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

    CourseDelete: builder.mutation<void, number>({
      query: (courseId) => ({
        url: `Courses/${courseId}`,
        method: "DELETE",
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
    contentCreate: builder.mutation<
      any,
      {
        partId: number;
        body: FormData;
        onUploadProgress?: (percent: number) => void;
      }
    >({
      invalidatesTags: ["course"],
      queryFn: async ({ partId, body, onUploadProgress }, api) => {
        const executeUpload = () => {
          return new Promise<{ data?: any; error?: any }>((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${BASE_ADDRESS}Courses/Parts/${partId}/Contents`);

            // CRITICAL: Get the FRESH token from state right before sending.
            const state = api.getState() as AppState;
            const accessToken = state?.auth?.accessToken;

            if (accessToken) {
              xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
            }

            let fakeProgressInterval: ReturnType<typeof setInterval> | null =
              null;
            let startTime: number | null = null;
            let phaseOneDuration = 0;

            if (onUploadProgress) {
              // Start timing the client upload
              startTime = Date.now();

              // 1. Client to Server upload (Maps 0-100% to 0-50% of total progress)
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const actualPercent = (event.loaded * 100) / event.total;
                  // Divide by 2 so client upload represents only the first half
                  const reportedPercent = Math.round(actualPercent / 2);
                  onUploadProgress(reportedPercent);
                }
              };

              // 2. Server to 3rd Party processing (Simulate the second half: 50% to 95%)
              xhr.upload.onload = () => {
                // Client upload is complete. Calculate how long it took.
                if (startTime) {
                  phaseOneDuration = Date.now() - startTime;
                }

                if (fakeProgressInterval) clearInterval(fakeProgressInterval);

                // Start the timer for Phase 2
                const phaseTwoStartTime = Date.now();

                // Prevent division by zero if the upload was instant (e.g., tiny file)
                const duration = Math.max(phaseOneDuration, 1);

                // Update every 50ms for a smooth bar
                fakeProgressInterval = setInterval(() => {
                  const elapsedPhaseTwo = Date.now() - phaseTwoStartTime;
                  let fraction = elapsedPhaseTwo / duration;

                  // Cap the fraction at 1 so it stops at 95%
                  if (fraction >= 1) {
                    fraction = 1;
                    if (fakeProgressInterval)
                      clearInterval(fakeProgressInterval);
                  }

                  // Map fraction (0 to 1) to progress (50 to 95)
                  const currentProgress = 50 + fraction * 45;
                  onUploadProgress(Math.round(currentProgress));
                }, 50);
              };
            }

            // Handle abort
            api.signal?.addEventListener("abort", () => {
              if (fakeProgressInterval) clearInterval(fakeProgressInterval);
              xhr.abort();
            });

            // 3. Handle final server response
            xhr.onload = () => {
              if (fakeProgressInterval) clearInterval(fakeProgressInterval);
              if (onUploadProgress) onUploadProgress(100); // Jump to 100% on success

              let data;
              try {
                data = JSON.parse(xhr.responseText);
              } catch {
                data = xhr.responseText;
              }

              if (xhr.status >= 200 && xhr.status < 300) {
                resolve({ data });
              } else {
                resolve({ error: { status: xhr.status, data } });
              }
            };

            xhr.onerror = () => {
              if (fakeProgressInterval) clearInterval(fakeProgressInterval);
              resolve({ error: { status: 0, data: "Network Error" } });
            };

            xhr.send(body);
          });
        };

        // 1. Execute the initial upload
        let result = await executeUpload();

        // 2. If 401, use the shared refresh logic and retry
        if (result.error && result.error.status === 401) {
          const refreshed = await refreshAccessToken(api);

          if (refreshed) {
            // Reset progress if retrying
            if (onUploadProgress) onUploadProgress(0);
            // Retry the upload with the newly acquired token
            result = await executeUpload();
          }
        }

        // 3. Return the final result to RTK Query
        return result;
      },
    }),

    /*   ContentCreate: builder.mutation<number, { body: FormData; partId: number }>(
      {
        query: ({ body, partId }) => ({
          url: `Courses/Parts/${partId}/Contents`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["course"],
      },
    ), */

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

    DocumentDelete: builder.mutation<void, number>({
      query: (documentId) => ({
        url: `Courses/Documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["course"],
    }),

    // Thumbnail-------------------------------------------------------
    ThumbnailCreate: builder.mutation<
      number,
      { body: FormData; courseId: number }
    >({
      query: ({ body, courseId }) => ({
        url: `Courses/${courseId}/Thumbnails`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["course"],
    }),

    ThumbnailDelete: builder.mutation<void, number>({
      query: (courseId) => ({
        url: `Courses/${courseId}/Thumbnails`,
        method: "DELETE",
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
  useCourseUpdateMutation,
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
  useDocumentDeleteMutation,
  useThumbnailCreateMutation,
  useThumbnailDeleteMutation,
  useCourseDeleteMutation,
} = courseApi;
