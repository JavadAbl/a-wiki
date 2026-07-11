import { createSlice } from "@reduxjs/toolkit";
import { userReducers } from "./user-reducers";

export type AuthState = object;

const initialState: AuthState = {};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: userReducers,
});

//---------------------------------------------------------------
export const userActions = userSlice.actions;
export const userReducer = userSlice.reducer;
