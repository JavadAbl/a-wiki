// base-api.ts
import {
  type BaseQueryFn,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { authActions } from "./auth/auth-slice";
import { toast } from "sonner";
import type { AppState } from "./store";
import status from "http-status";
import { refreshAccessToken } from "../utils/refresh-token";

export const BASE_ADDRESS = "http://localhost:3000/api/";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_ADDRESS,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as AppState;
    const token = state?.auth?.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const meta = result.meta;

  // 1. Success Toasts
  if (!result.error && meta) {
    if (
      (meta.request.method === "POST" &&
        meta.response?.status === status.CREATED) ||
      ((meta.request.method === "PUT" || meta.request.method === "PATCH") &&
        meta.response?.status === status.OK) ||
      (meta.request.method === "DELETE" &&
        meta.response?.status === status.NO_CONTENT)
    ) {
      toast.success("عملیات موفقیت آمیز");
    }
  }

  // 2. 401 Handling & Token Refresh (Using shared utility)
  if (result.error && result.error.status === 401) {
    const refreshed = await refreshAccessToken(api);

    if (refreshed) {
      // Retry the original request with the new token (prepareHeaders will pick it up)
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  // 3. Error Toasts (Non-401)
  if (result.error && result.error.status !== 401) {
    if (api.endpoint !== "getUserByContext") {
      let message = "Server error";
      if (typeof result.error.data === "string") {
        message = result.error.data;
      } else if (
        result.error.data &&
        typeof result.error.data === "object" &&
        "message" in result.error.data
      ) {
        message = (result.error.data as any).message;
      } else if (result?.error?.data?.detail) {
        message = result.error.data.detail;
      }
      toast.error(message);
    }
  }

  // 4. Final 401 check (if refresh failed or wasn't possible)
  if (result.error && result.error.status === 401) {
    api.dispatch(authActions.logout());
  }

  return result;
};
export const getAuthorizedImage = async (
  url: string | null | undefined,
  accessToken: string,
) => {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // ⚠️ IMPORTANT: The component using this URL MUST call URL.revokeObjectURL(objectUrl)
    // in a useEffect cleanup function to prevent memory leaks.

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  } catch {
    return null;
  }
};
