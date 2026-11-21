import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "../base-api";
import type { TenantDto } from "./dto/tenant.dto";

export const tenantApi = createApi({
  reducerPath: "tenantApi",
  baseQuery: baseApi,
  tagTypes: ["tenant"],

  endpoints: (builder) => ({
    /// public: instances shown on the selection screen
    TenantsGetManyPublic: builder.query<
      Pick<TenantDto, "id" | "name" | "slug" | "description" | "logoUrl">[],
      void
    >({
      query: () => ({
        url: "Tenants",
      }),
      providesTags: ["tenant"],
    }),

    /// super admin: full list incl. inactive
    TenantsGetMany: builder.query<TenantDto[], void>({
      query: () => ({
        url: "Tenants/All",
      }),
      providesTags: ["tenant"],
    }),

    TenantCreate: builder.mutation<
      number,
      {
        name: string;
        slug: string;
        description?: string;
        logoUrl?: string;
        order?: number;
        isActive?: boolean;
      }
    >({
      query: (body) => ({
        url: "Tenants",
        method: "POST",
        body,
      }),
      invalidatesTags: ["tenant"],
    }),

    TenantUpdate: builder.mutation<
      void,
      {
        body: {
          name?: string;
          slug?: string;
          description?: string;
          logoUrl?: string;
          order?: number;
        };
        tenantId: number;
      }
    >({
      query: ({ body, tenantId }) => ({
        url: `Tenants/${tenantId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["tenant"],
    }),

    TenantSetActive: builder.mutation<void, { tenantId: number; isActive: boolean }>({
      query: ({ tenantId, isActive }) => ({
        url: `Tenants/${tenantId}/Active`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["tenant"],
    }),

    TenantDelete: builder.mutation<void, number>({
      query: (tenantId) => ({
        url: `Tenants/${tenantId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["tenant"],
    }),
  }),
});

export const {
  useTenantsGetManyPublicQuery,
  useTenantsGetManyQuery,
  useTenantCreateMutation,
  useTenantUpdateMutation,
  useTenantSetActiveMutation,
  useTenantDeleteMutation,
} = tenantApi;
