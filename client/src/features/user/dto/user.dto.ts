export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  mobile: string | null;
  nationalCode: string;
  isActive: boolean;
  role: string;
  groupId: number | null;
}
