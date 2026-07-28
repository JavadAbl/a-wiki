// utils/refresh-token.ts
import { Mutex } from "async-mutex";

import type { BaseQueryApi } from "@reduxjs/toolkit/query/react";
import type { AppState } from "../features/store";
import { authActions } from "../features/auth/auth-slice";
import { BASE_ADDRESS } from "../features/base-api";

const mutex = new Mutex();

/**
 * Attempts to refresh the access token.
 * Handles concurrency via mutex to prevent multiple simultaneous refresh requests.
 * @returns true if successfully refreshed, false otherwise (and triggers logout).
 */
export async function refreshAccessToken(api: BaseQueryApi): Promise<boolean> {
  // 1. If another request is already refreshing, wait for it to finish
  if (mutex.isLocked()) {
    await mutex.waitForUnlock();
    // After waiting, check if the token was successfully refreshed by the other request
    const state = api.getState() as AppState;
    return !!state?.auth?.accessToken;
  }

  // 2. Otherwise, acquire the lock and perform the refresh ourselves
  const release = await mutex.acquire();
  try {
    const state = api.getState() as AppState;
    const refreshToken = state?.auth?.refreshToken;

    if (!refreshToken) {
      api.dispatch(authActions.logout());
      return false;
    }

    const refreshResult = await fetch(`${BASE_ADDRESS}Auth/RefreshToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResult.ok) {
      const data = await refreshResult.json();
      api.dispatch(
        authActions.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );
      return true;
    } else {
      // Refresh failed (e.g., refresh token expired)
      api.dispatch(authActions.logout());
      return false;
    }
  } finally {
    // 3. Always release the mutex so other waiting requests can proceed
    release();
  }
}
