import { createApi } from "@reduxjs/toolkit/query/react";
import type { UserDto } from "./dto/user.dto";
import { baseApi } from "../base-api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseApi,
  //  tagTypes: ["auth"],
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

export const { useLazyGetUserByContextQuery } = authApi;
