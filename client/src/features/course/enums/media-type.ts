export const MediaType = {
  Video: "Video",
  Audio: "Audio",
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];
