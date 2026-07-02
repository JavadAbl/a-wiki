import { Global, Module } from '@nestjs/common';
import { InboxEventRepository } from './Repositories/inbox-event.repository';
import { OutboxEventRepository } from './Repositories/outbox-event.repository';

@Global()
@Module({
  imports: [],
  providers: [InboxEventRepository, OutboxEventRepository],
  exports: [InboxEventRepository, OutboxEventRepository],
})
export class EventBoxModule {}
