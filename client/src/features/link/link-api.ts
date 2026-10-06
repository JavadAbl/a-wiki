import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../base-api";
import type { LinkDto } from "./dto/link.dto";

export const linkApi = createApi({
  reducerPath: "linkApi",
  baseQuery: baseApi,
  tagTypes: ["link"],

  endpoints: (builder) => ({
    LinksGetMany: builder.query<LinkDto[], void>({
      query: () => ({
        url: "Links",
      }),
      providesTags: ["link"],
    }),

    LinkCreate: builder.mutation<number, { url: string; title?: string; description?: string; order?: number }>({
      query: (body) => ({
        url: "Links",
        method: "POST",
        body,
      }),
      invalidatesTags: ["link"],
    }),

    LinkUpdate: builder.mutation<
      void,
      { body: { url?: string; title?: string; description?: string; order?: number }; linkId: number }
    >({
      query: ({ body, linkId }) => ({
        url: `Links/${linkId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["link"],
    }),

    LinkDelete: builder.mutation<void, number>({
      query: (linkId) => ({
        url: `Links/${linkId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["link"],
    }),
  }),
});

export const {
  useLinksGetManyQuery,
  useLinkCreateMutation,
  useLinkUpdateMutation,
  useLinkDeleteMutation,
} = linkApi;
