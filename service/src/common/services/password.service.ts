import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  constructor() {}

  validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
