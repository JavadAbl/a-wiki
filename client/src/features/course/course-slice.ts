import { createSlice } from "@reduxjs/toolkit";
import { courseReducers } from "./course-reducers";

export type CourseState = object;

const initialState: CourseState = {};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: courseReducers,
});

//---------------------------------------------------------------
export const courseActions = courseSlice.actions;
export const courseReducer = courseSlice.reducer;
