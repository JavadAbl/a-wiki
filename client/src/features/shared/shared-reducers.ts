import type { PayloadAction, WritableDraft } from "@reduxjs/toolkit";
import type { SharedState } from "./shared-slice";

export const sharedReducers = {
  setIsOpenLogin: (
    state: WritableDraft<SharedState>,
    action: PayloadAction<{ isOpen: boolean }>,
  ) => {
    state.isOpenLogin = action.payload.isOpen;
  },
};
