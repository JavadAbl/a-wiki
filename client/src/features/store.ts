import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "../features/auth/auth-api";
import {
  authListenerMiddleware,
  authReducer,
} from "../features/auth/auth-slice";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [authApi.reducerPath]: authApi.reducer,

    auth: authReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .prepend(authListenerMiddleware.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Export the root state type and the dispatch type for use in typed hooks
export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
