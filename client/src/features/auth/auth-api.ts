import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../base-api";
import type { LoginDto } from "./schemas/login-schema";
import type { SendOtpDto } from "./schemas/send-otp-schema";
import type { AuthDto } from "./dto/auth.dto";
import type { ResetPasswordDto } from "./schemas/reset-password-schema";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseApi,
  //  tagTypes: ["auth"],

  endpoints: (builder) => ({
    login: builder.mutation<AuthDto, LoginDto>({
      query: (body) => ({
        url: "Auth/Login",
        method: "POST",
        body,
      }),
    }),

    sendOtp: builder.mutation<void, SendOtpDto>({
      query: (body) => ({
        url: "Auth/Otp/Send",
        method: "POST",
        body,
      }),
    }),

    ResetPasswordOtp: builder.mutation<void, ResetPasswordDto>({
      query: (body) => ({
        url: "Users/ResetPasswordOtp",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSendOtpMutation,
  useResetPasswordOtpMutation,
} = authApi;
