import { Injectable } from '@nestjs/common';

@Injectable()
export class CronLockService {
  private locks = new Map<string, boolean>();

  async runLocked(key: string, task: () => Promise<void>) {
    if (this.locks.get(key)) {
      console.log(`Task "${key}" skipped; previous run still active.`);
      return;
    }

    this.locks.set(key, true);
    try {
      await task();
    } catch (error) {
      console.error(error);
    } finally {
      this.locks.set(key, false);
    }
  }
}
