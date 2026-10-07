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

    LinkSetOrders: builder.mutation<
      void,
      { orders: { id: number; order: number }[] }
    >({
      query: (body) => ({
        url: "Links/SetOrders",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["link"],
      // Optimistic update: reorder the cached list immediately, undo on failure
      async onQueryStarted({ orders }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          linkApi.util.updateQueryData("LinksGetMany", undefined, (draft) => {
            const orderById = new Map(orders.map((o) => [o.id, o.order]));
            return draft
              .map((l) => ({ ...l, order: orderById.get(l.id) ?? l.order }))
              .sort((a, b) => a.order - b.order || a.id - b.id);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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
  useLinkSetOrdersMutation,
  useLinkDeleteMutation,
} = linkApi;
