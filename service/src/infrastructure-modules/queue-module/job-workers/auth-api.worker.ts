// jobs.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import {
  JOB_AUTH_ROLE_PERMISSION_CREATE,
  JOB_AUTH_ROLE_PERMISSION_DELETE,
  QUEUE_AUTH_API,
} from '../config/queue.config';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { InboxEvent } from 'src/generated/prisma/client';
import { AuthService } from 'src/auth-module/auth.service';
import { RolePermissionCreateEvent } from 'src/infrastructure-modules/rmq-module/contracts/role-permission-create-event';
import { RolePermissionDeleteEvent } from 'src/infrastructure-modules/rmq-module/contracts/role-permission-delete-event';

@Processor(QUEUE_AUTH_API)
export class AuthApiJobWorker {
  constructor(
    private readonly inboxRep: InboxEventRepository,
    private readonly authService: AuthService,
  ) {}

  @Process(JOB_AUTH_ROLE_PERMISSION_CREATE)
  async handleAuthRolePermissionCreate(job: Job<InboxEvent>) {
    const { id, payload } = job.data;
    try {
      const parsedPayload: RolePermissionCreateEvent = JSON.parse(
        payload as string,
      );
      await this.authService.createRolePermission(parsedPayload);
      await this.inboxRep.update({
        where: { id },
        data: { status: 'Handled', handledAt: new Date() },
      });
    } catch (error) {
      console.error(error);
      await this.inboxRep.update({
        where: { id },
        data: { status: 'Error', error: JSON.stringify(error) },
      });
    }
  }

  @Process(JOB_AUTH_ROLE_PERMISSION_DELETE)
  async handleAuthRolePermissionDelete(job: Job<InboxEvent>) {
    const { id, payload } = job.data;
    try {
      const parsedPayload: RolePermissionDeleteEvent = JSON.parse(
        payload as string,
      );
      await this.authService.deleteRolePermission(parsedPayload);
      await this.inboxRep.update({
        where: { id },
        data: { status: 'Handled', handledAt: new Date() },
      });
    } catch (error) {
      console.error(error);
      await this.inboxRep.update({
        where: { id },
        data: { status: 'Error', error: JSON.stringify(error) },
      });
    }
  }
}
