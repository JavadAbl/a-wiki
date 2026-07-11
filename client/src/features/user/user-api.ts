import { createApi } from "@reduxjs/toolkit/query/react";
import type { UserDto } from "./dto/user.dto";
import { baseApi } from "../base-api";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseApi,
  //  tagTypes: ["user"],
  endpoints: (builder) => ({
    getUserByContext: builder.query<UserDto, void>({
      query: () => ({
        url: "Users/Context",
      }),
    }),

    /* sendOtp: builder.mutation<void, SendOtpDto>({
      query: (body) => ({
        url: "Auth-Api/Auth/SendOtp",
        method: "POST",
        body,
      }),
    }), */
  }),
});

export const { useLazyGetUserByContextQuery } = userApi;
