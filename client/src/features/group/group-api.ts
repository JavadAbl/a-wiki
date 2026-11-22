import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../base-api";
import type { GetManyQuery, GetManyReply } from "../../utils/types";
import type { GroupDto, GroupDetailsDto } from "./dto/group.dto";
import type { GroupCreateDto } from "./schemas/group-create.schema";
import type { GroupUpdateDto } from "./schemas/group-update.schema";

export type GroupCreateBody = Omit<GroupCreateDto, "description"> & {
  description?: string | null;
};
export type GroupUpdateBody = Omit<GroupUpdateDto, "description"> & {
  description?: string | null;
};

export const groupApi = createApi({
  reducerPath: "groupApi",
  baseQuery: baseApi,
  tagTypes: ["group", "user"],
  endpoints: (builder) => ({
    GroupGetMany: builder.query<GetManyReply<GroupDto>, GetManyQuery>({
      query: (params) => ({
        url: "Groups",
        params,
      }),
      providesTags: ["group"],
    }),

    GroupGetById: builder.query<GroupDetailsDto, number>({
      query: (id) => ({
        url: `Groups/${id}`,
      }),
      providesTags: ["group"],
    }),

    GroupCreate: builder.mutation<number, GroupCreateBody>({
      query: (body) => ({
        url: "Groups",
        method: "POST",
        body,
      }),
      invalidatesTags: ["group"],
    }),

    GroupUpdate: builder.mutation<void, { groupId: number; body: GroupUpdateBody }>({
      query: ({ groupId, body }) => ({
        url: `Groups/${groupId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["group"],
    }),

    GroupDelete: builder.mutation<void, number>({
      query: (groupId) => ({
        url: `Groups/${groupId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["group", "user"],
    }),

    GroupSetCourses: builder.mutation<void, { groupId: number; courseIds: number[] }>({
      query: ({ groupId, courseIds }) => ({
        url: `Groups/${groupId}/SetCourses`,
        method: "PATCH",
        body: { courseIds },
      }),
      invalidatesTags: ["group"],
    }),

    GroupSetCategories: builder.mutation<void, { groupId: number; categoryIds: number[] }>({
      query: ({ groupId, categoryIds }) => ({
        url: `Groups/${groupId}/SetCategories`,
        method: "PATCH",
        body: { categoryIds },
      }),
      invalidatesTags: ["group"],
    }),
  }),
});

export const {
  useGroupGetManyQuery,
  useGroupGetByIdQuery,
  useLazyGroupGetByIdQuery,
  useGroupCreateMutation,
  useGroupUpdateMutation,
  useGroupDeleteMutation,
  useGroupSetCoursesMutation,
  useGroupSetCategoriesMutation,
} = groupApi;
