import { SetMetadata } from '@nestjs/common';

export const Admin_KEY = 'isAdmin';
export const Admin = () => SetMetadata(Admin_KEY, true);
