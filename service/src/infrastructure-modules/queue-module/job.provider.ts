import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';
import { QUEUE_AUTH_API } from './config/queue.config';

@Injectable()
export class JobProvider {
  constructor(@InjectQueue(QUEUE_AUTH_API) private jobQueue: Queue) {}

  async addAuthApiJob(name: string, data: any) {
    await this.jobQueue.add(name, data, { removeOnComplete: true, removeOnFail: true });
  }
}
