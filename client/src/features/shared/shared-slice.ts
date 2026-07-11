import { createSlice } from "@reduxjs/toolkit";
import { sharedReducers } from "./shared-reducers";

export type SharedState = {
  isOpenLogin: boolean;
};

const initialState: SharedState = {
  isOpenLogin: false,
};

const sharedSlice = createSlice({
  name: "shared",
  initialState,
  reducers: sharedReducers,
});

//---------------------------------------------------------------
export const sharedActions = sharedSlice.actions;
export const sharedReducer = sharedSlice.reducer;
