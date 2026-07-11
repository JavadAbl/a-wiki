import { createListenerMiddleware, createSlice } from "@reduxjs/toolkit";
import { authReducers } from "./auth-reducers";
import { storage } from "../../utils/storage";
import type { UserDto } from "../user/dto/user.dto";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuth: boolean;
  user: UserDto | null;
};

const initialState: AuthState = {
  accessToken: null,
  isAuth: false,
  user: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: authReducers,
});

//---------------------------------------------------------------
export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;

export const authListenerMiddleware = createListenerMiddleware();

authListenerMiddleware.startListening({
  actionCreator: authActions.setTokens,
  effect: (action) => {
    storage.setTokens(action.payload.accessToken, action.payload.refreshToken);
  },
});

authListenerMiddleware.startListening({
  actionCreator: authActions.logout,
  effect: () => {
    storage.clearTokens();
  },
});

authListenerMiddleware.startListening({
  actionCreator: authActions.login,
  effect: (action) => {
    storage.setTokens(action.payload.accessToken, action.payload.refreshToken);
  },
});
