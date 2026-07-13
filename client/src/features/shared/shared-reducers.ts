import type { PayloadAction, WritableDraft } from "@reduxjs/toolkit";
import type { SharedState } from "./shared-slice";

export const sharedReducers = {
  setIsOpenLogin: (
    state: WritableDraft<SharedState>,
    action: PayloadAction<{ isOpen: boolean; redirect?: string }>,
  ) => {
    state.isOpenLogin = action.payload.isOpen;
    state.loginRedirect = action.payload.redirect;
  },
};
