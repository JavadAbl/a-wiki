import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../base-api";

export const sharedApi = createApi({
  reducerPath: "sharedApi",
  baseQuery: baseApi,
  tagTypes: [],

  endpoints: (builder) => ({
    DashboardHeroData: builder.query<
      {
        courseCount: number;
        courseDuration: number;
        userCount: number;
      },
      void
    >({
      query: () => ({
        url: "DashboardHeroData",
      }),
    }),
  }),
});

export const { useDashboardHeroDataQuery } = sharedApi;
