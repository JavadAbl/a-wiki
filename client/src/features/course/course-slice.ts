import { createSlice } from "@reduxjs/toolkit";
import { courseReducers } from "./course-reducers";
import type { ContentDto } from "./dto/content.dto";
import type { SectionDto } from "./dto/section.dto";
import type { CourseDetailsDto } from "./dto/course.details.dto";
import type { PartDto } from "./dto/part.dto";

// One entry per playable content, in course order (sections -> parts -> contents)
export type CourseBrowserPlaylistItem = {
  content: ContentDto;
  sectionId: number;
  partId: number;
};

export type CourseState = {
  courseBrowserSelectedCourse: CourseDetailsDto | null;
  courseBrowserSelectedSection: SectionDto | null;
  courseBrowserSelectedPart: PartDto | null;
  courseBrowserSelectedContent: ContentDto | null;
  // Flat, explicitly sorted playlist shared by the player (prev/next) and the
  // part view (marking the playing content), derived from the selected course
  courseBrowserPlaylist: CourseBrowserPlaylistItem[];
  // Open accordion items ("section-{id}" / "part-{id}") shared by all
  // CourseBrowserParts instances so their state survives instance swaps
  courseBrowserOpenAccordionItems: string[];
};

const initialState: CourseState = {
  courseBrowserSelectedCourse: null,
  courseBrowserSelectedSection: null,
  courseBrowserSelectedPart: null,
  courseBrowserSelectedContent: null,
  courseBrowserPlaylist: [],
  courseBrowserOpenAccordionItems: [],
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: courseReducers,
});

//---------------------------------------------------------------
export const courseActions = courseSlice.actions;
export const courseReducer = courseSlice.reducer;
