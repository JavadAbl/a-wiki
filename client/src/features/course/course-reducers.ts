import type { PayloadAction, WritableDraft } from "@reduxjs/toolkit";
import type { CourseState } from "./course-slice";
import type { ContentDto } from "./dto/content.dto";
import type { SectionDto } from "./dto/section.dto";
import type { CourseDetailsDto } from "./dto/course.details.dto";
import type { PartDto } from "./dto/part.dto";

// Sort helper: order field first, then id as tiebreaker
const byOrder = <T extends { order?: number; id: number }>(a: T, b: T) =>
  (a.order ?? 0) - (b.order ?? 0) || a.id - b.id;

// Flatten sections -> parts -> contents into an explicitly sorted playlist
function buildPlaylist(course: CourseDetailsDto | null): CourseState["courseBrowserPlaylist"] {
  const items: CourseState["courseBrowserPlaylist"] = [];

  [...(course?.sections ?? [])]
    .sort(byOrder)
    .forEach((section) => {
      [...(section.parts ?? [])]
        .sort(byOrder)
        .forEach((part) => {
          [...(part.contents ?? [])]
            .sort(byOrder)
            .forEach((content) => {
              items.push({
                content,
                sectionId: section.id,
                partId: part.id,
              });
            });
        });
    });

  return items;
}

export const courseReducers = {
  setCourseBrowserSelectedCourse: (
    state: WritableDraft<CourseState>,
    action: PayloadAction<{
      course: CourseDetailsDto | null;
    }>,
  ) => {
    const { course } = action.payload;
    state.courseBrowserSelectedCourse = course;
    state.courseBrowserPlaylist = buildPlaylist(course);
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

  setCourseBrowserSelectedPart: (
    state: WritableDraft<CourseState>,
    action: PayloadAction<{
      part: PartDto | null;
    }>,
  ) => {
    const { part } = action.payload;
    state.courseBrowserSelectedPart = part;
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

  setCourseBrowserOpenAccordionItems: (
    state: WritableDraft<CourseState>,
    action: PayloadAction<{
      items: string[];
    }>,
  ) => {
    state.courseBrowserOpenAccordionItems = action.payload.items;
  },
};
