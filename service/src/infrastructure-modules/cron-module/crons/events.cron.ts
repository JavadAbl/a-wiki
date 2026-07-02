import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import {
  JOB_AUTH_ROLE_PERMISSION_CREATE,
  JOB_AUTH_ROLE_PERMISSION_DELETE,
} from '../../queue-module/config/queue.config';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import {
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
  RMQ_Q_AUTH_ROLE_PERMISSION_DELETE,
} from '../../rmq-module/config/rmq.config';
import { CronLockService } from '../cron-lock.service';
import { JobProvider } from 'src/infrastructure-modules/queue-module/job.provider';

@Injectable()
export class InboxEventCron {
  constructor(
    private readonly lockService: CronLockService,
    private readonly inboxRep: InboxEventRepository,
    private readonly jobProvider: JobProvider,
  ) {}

  @Interval(10000)
  async handleInboxEvents() {
    await this.lockService.runLocked(this.handleInboxEvents.name, async () => {
      const unhandledEvents = await this.inboxRep.prismaClient.inboxEvent.findMany({
        where: { status: 'Pending' },
      });

      for (const event of unhandledEvents) {
        switch (event.queue) {
          case RMQ_Q_AUTH_ROLE_PERMISSION_CREATE:
            await this.jobProvider.addAuthApiJob(JOB_AUTH_ROLE_PERMISSION_CREATE, event);
            break;

          case RMQ_Q_AUTH_ROLE_PERMISSION_DELETE:
            await this.jobProvider.addAuthApiJob(JOB_AUTH_ROLE_PERMISSION_DELETE, event);
            break;
        }
      }

      await this.inboxRep.updateMany({ data: { status: 'InQueue' }, where: { status: 'Pending' } });
    });
  }
}
