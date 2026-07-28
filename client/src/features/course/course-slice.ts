import { createSlice } from "@reduxjs/toolkit";
import { courseReducers } from "./course-reducers";
import type { ContentDto } from "./dto/content.dto";
import type { SectionDto } from "./dto/section.dto";
import type { CourseDetailsDto } from "./dto/course.details.dto";
import type { PartDto } from "./dto/part.dto";

export type CourseState = {
  courseBrowserSelectedCourse: CourseDetailsDto | null;
  courseBrowserSelectedSection: SectionDto | null;
  courseBrowserSelectedPart: PartDto | null;
  courseBrowserSelectedContent: ContentDto | null;
};

const initialState: CourseState = {
  courseBrowserSelectedCourse: null,
  courseBrowserSelectedSection: null,
  courseBrowserSelectedPart: null,
  courseBrowserSelectedContent: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: courseReducers,
});

//---------------------------------------------------------------
export const courseActions = courseSlice.actions;
export const courseReducer = courseSlice.reducer;
