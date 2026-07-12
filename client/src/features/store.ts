import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "../features/auth/auth-api";
import {
  authListenerMiddleware,
  authReducer,
} from "../features/auth/auth-slice";
import { userApi } from "./user/user-api";
import { userReducer } from "./user/user-slice";
import { sharedReducer } from "./shared/shared-slice";
import { courseApi } from "./course/course-api";
import { courseReducer } from "./course/course-slice";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,

    shared: sharedReducer,
    auth: authReducer,
    user: userReducer,
    course: courseReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(courseApi.middleware)
      .prepend(authListenerMiddleware.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Export the root state type and the dispatch type for use in typed hooks
export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
