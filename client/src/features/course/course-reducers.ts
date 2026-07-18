import type { PayloadAction, WritableDraft } from "@reduxjs/toolkit";
import type { CourseState } from "./course-slice";
import type { ContentDto } from "./dto/content.dto";
import type { SectionDto } from "./dto/section.dto";
import type { CourseDetailsDto } from "./dto/course.details.dto";

export const courseReducers = {
  setCourseBrowserSelectedCourse: (
    state: WritableDraft<CourseState>,
    action: PayloadAction<{
      course: CourseDetailsDto | null;
    }>,
  ) => {
    const { course } = action.payload;
    state.courseBrowserSelectedCourse = course;
  },

  setCourseBrowserSelectedSection: (
    state: WritableDraft<CourseState>,
    action: PayloadAction<{
      section: SectionDto | null;
    }>,
  ) => {
    const { section } = action.payload;
    state.courseBrowserSelectedSection = section;
  },

  setCourseBrowserSelectedPartId: (
    state: WritableDraft<CourseState>,
    action: PayloadAction<{
      partId: number | null;
    }>,
  ) => {
    const { partId } = action.payload;
    state.courseBrowserSelectedPartId = partId;
  },

  setCourseBrowserSelectedContent: (
    state: WritableDraft<CourseState>,
    action: PayloadAction<{
      content: ContentDto | null;
    }>,
  ) => {
    const { content } = action.payload;
    state.courseBrowserSelectedContent = content;
  },
};
