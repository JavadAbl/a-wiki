import { createApi } from "@reduxjs/toolkit/query/react";
import type { UserDto } from "./dto/user.dto";
import { baseApi } from "../base-api";
import type { GetManyQuery, GetManyReply } from "../../utils/types";
import type { UserCreateDto } from "./schemas/user-create.schema";
import type { UserUpdateDto } from "./schemas/user-update.schema";

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
      query: () => ({
        url: "Users",
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
  }),
});

export const {
  useUserGetByContextQuery,
  useUserGetManyQuery,
  useUserCreateMutation,
  useUserUpdateMutation,
  useLazyUserGetByContextQuery,
} = userApi;
