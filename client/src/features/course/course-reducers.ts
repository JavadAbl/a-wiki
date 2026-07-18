import type { PayloadAction, WritableDraft } from "@reduxjs/toolkit";
import type { CourseState } from "./course-slice";
import type { ContentDto } from "./dto/content.dto";
import type { SectionDto } from "./dto/section.dto";

export const courseReducers = {
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
