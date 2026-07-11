import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../base-api";
import type { AuthDto } from "./dto/auth.dto";
import type { LoginDto } from "./schemas/login-schema";

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
  }),
});

export const { useLoginMutation } = authApi;
