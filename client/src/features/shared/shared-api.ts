import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../base-api";

export const sharedApi = createApi({
  reducerPath: "sharedApi",
  baseQuery: baseApi,
  tagTypes: ["HeroImageURL"],

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
    HeroImageURL: builder.query<{ url: string | null }, void>({
      query: () => ({
        url: "HeroImageURL",
      }),
      providesTags: ["HeroImageURL"],
    }),
    HeroImageUpdate: builder.mutation<void, { body: FormData }>({
      query: ({ body }) => ({
        url: "HeroImage",
        method: "POST",
        body,
      }),
      invalidatesTags: ["HeroImageURL"],
    }),
    HeroImageDelete: builder.mutation<void, void>({
      query: () => ({
        url: "HeroImage",
        method: "DELETE",
      }),
      invalidatesTags: ["HeroImageURL"],
    }),
  }),
});

export const {
  useDashboardHeroDataQuery,
  useHeroImageURLQuery,
  useHeroImageUpdateMutation,
  useHeroImageDeleteMutation,
} = sharedApi;
