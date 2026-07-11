import {
  type BaseQueryFn,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { authActions } from "./auth/auth-slice";
import { toast } from "sonner";
import type { AppState } from "./store";
import status from "http-status";

const BASE_ADDRESS = "http://localhost:3000/api/";

// Create a mutex to prevent multiple refresh requests at the same time
const mutex = new Mutex();

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
  // 1. Wait for mutex release (if another request is currently refreshing)
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);
  const meta = result.meta;

  if (!result.error) {
    if (
      // POST with Created (201)
      (meta?.request.method === "POST" &&
        meta?.response?.status === status.CREATED) ||
      // PUT or PATCH with OK (200)
      ((meta?.request.method === "PUT" || meta?.request.method === "PATCH") &&
        meta?.response?.status === status.OK) ||
      // DELETE with No Content (204)
      (meta?.request.method === "DELETE" &&
        meta?.response?.status === status.NO_CONTENT)
    )
      toast.success("Operation successful");
  }

  if (result.error) {
    const err = result.error;

    // 2. Check if error is 401 and we are not already refreshing
    if (err.status === 401) {
      // Check if a refresh is already in progress
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();

        try {
          const state = api.getState() as AppState;
          const refreshToken = state.auth.refreshToken;

          // 3. If we have a refresh token, try to get a new access token
          if (refreshToken) {
            // NOTE: Adjust the URL and parameters to match your Keycloak/OpenID configuration
            // This example assumes a standard OAuth2 Token Endpoint (often at /protocol/openid-connect/token for Keycloak)
            const refreshResult = await fetch(
              `${BASE_ADDRESS}Auth-Api/Auth/Refresh`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  refreshToken,
                }),
              },
            );

            if (refreshResult.ok) {
              const data = await refreshResult.json();
              // 4. Update the Redux store with the new access token
              api.dispatch(
                authActions.setTokens({
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                }),
              );

              // 5. Retry the original request with the new token
              // The rawBaseQuery will pick up the new token from the state via prepareHeaders
              result = await rawBaseQuery(args, api, extraOptions);
            } else {
              // Refresh failed (token expired or invalid) -> Logout
              api.dispatch(authActions.logout());
            }
          } else {
            // No refresh token in state -> Logout
            api.dispatch(authActions.logout());
          }
        } finally {
          // 6. Release the mutex so other requests can proceed
          release();
        }
      } else {
        // If mutex is locked, wait for the refresh to finish and retry the request
        await mutex.waitForUnlock();
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }

    // Handle non-401 errors (toasts)
    if (result.error && result.error.status !== 401)
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
        } else {
          if (result?.error?.data?.detail)
            message = result?.error?.data?.detail;
        }

        toast.error(message);
      }

    // If we still have a 401 error after attempting refresh, logout
    if (result.error && result.error.status === 401) {
      api.dispatch(authActions.logout());
    }
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
