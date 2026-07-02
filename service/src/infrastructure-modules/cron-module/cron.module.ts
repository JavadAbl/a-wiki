import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InboxEventCron } from './crons/events.cron';
import { CronLockService } from './cron-lock.service';

@Module({ imports: [ScheduleModule.forRoot()], providers: [CronLockService, InboxEventCron] })
export class CronModule {}
