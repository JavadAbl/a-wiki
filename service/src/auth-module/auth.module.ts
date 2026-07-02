import { Module } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Module({ imports: [], providers: [AuthRepository, AuthService], exports: [AuthService] })
export class AuthModule {}
