export interface GroupDto {
  id: number;
  name: string;
  description?: string | null;
}

export interface GroupDetailsDto extends GroupDto {
  courseIds: number[];
  categoryIds: number[];
}
