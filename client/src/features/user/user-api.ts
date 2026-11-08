import { createApi } from "@reduxjs/toolkit/query/react";
import type { UserDto } from "./dto/user.dto";
import { baseApi } from "../base-api";
import type { GetManyQuery, GetManyReply } from "../../utils/types";
import type { UserCreateDto } from "./schemas/user-create.schema";
import type { UserUpdateDto } from "./schemas/user-update.schema";
import type { UserBatchResult } from "./dto/user-batch-result.dto";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseApi,
  tagTypes: ["user"],
  endpoints: (builder) => ({
    UserGetByContext: builder.query<UserDto, void>({
      query: () => ({
        url: "Users/Context",
      }),
    }),

    UserGetMany: builder.query<GetManyReply<UserDto>, GetManyQuery>({
      query: (params) => ({
        url: "Users",
        params,
      }),
      providesTags: ["user"],
    }),

    UserCreate: builder.mutation<number, UserCreateDto>({
      query: (body) => ({
        url: "Users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["user"],
    }),

    UserUpdate: builder.mutation<
      number,
      { body: UserUpdateDto; userId: number }
    >({
      query: ({ body, userId }) => ({
        url: `Users/${userId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["user"],
    }),
    UserBatchTemplate: builder.query<Blob, void>({
      query: () => ({
        url: "Users/Batch/Template",
        responseHandler: (response) => response.blob(),
        cache: "no-cache",
      }),
    }),

    UserBatchCreate: builder.mutation<UserBatchResult, { body: FormData }>({
      query: ({ body }) => ({
        url: "Users/Batch",
        method: "POST",
        body,
      }),
      invalidatesTags: ["user"],
    }),
  }),
});

export const {
  useUserGetByContextQuery,
  useUserGetManyQuery,
  useUserCreateMutation,
  useUserUpdateMutation,
  useLazyUserGetByContextQuery,
  useLazyUserBatchTemplateQuery,
  useUserBatchCreateMutation,
} = userApi;
