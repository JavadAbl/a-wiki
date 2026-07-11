import type { PayloadAction, WritableDraft } from "@reduxjs/toolkit";
import type { AuthState } from "./auth-slice";
import type { UserDto } from "./dto/auth.dto";

export const authReducers = {
  logout: (state: WritableDraft<AuthState>) => {
    state.isAuth = false;
    state.user = null;
    state.accessToken = null;
    state.refreshToken = null;
  },

  login: (
    state: WritableDraft<AuthState>,
    action: PayloadAction<{
      user: UserDto;
      accessToken: string;
      refreshToken: string;
    }>,
  ) => {
    const { accessToken, refreshToken, user } = action.payload;
    state.isAuth = true;
    state.user = user;
    state.accessToken = accessToken;
    state.refreshToken = refreshToken;
  },

  setTokens: (
    state: WritableDraft<AuthState>,
    action: PayloadAction<{
      accessToken: string;
      refreshToken: string;
    }>,
  ) => {
    const { accessToken, refreshToken } = action.payload;

    state.accessToken = accessToken;
    state.refreshToken = refreshToken;
  },
};
