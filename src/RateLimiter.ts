export default class RateLimiter {
  private interval: number;
  private maxPerInterval: number;
  private maxConcurrency: number;
  private queue: {
    id: number;
    fn: () => Promise<any>;
    resolve: (value: unknown) => void;
    reject: () => any;
  }[];
  private running: {
    id: number;
    start: number;
    end?: number;
  }[];
  private finished: typeof this.running &
    {
      end: number;
    }[];
  private jobsAdded: number;

  constructor({
    maxPerInterval,
    maxConcurrency,
    interval
  }: {
    maxPerInterval: number;
    maxConcurrency: number;
    interval: string;
  }) {
    this.maxPerInterval = maxPerInterval;
    this.maxConcurrency = maxConcurrency;
    this.queue = [];
    this.running = [];
    this.finished = [];
    this.jobsAdded = 0;
    switch (interval) {
      case 'second':
        this.interval = 1000;
        break;
      case 'minute':
        this.interval = 60000;
        break;
      case 'hour':
        this.interval = 3600000;
        break;
      case 'day':
        this.interval = 86400000;
        break;
      default:
        throw new Error('Invalid interval');
    }
  }

  add(fn: () => Promise<any>) {
    const jobId = this.jobsAdded;
    this.jobsAdded++;
    return new Promise((resolve, reject) => {
      this.queue.push({ id: jobId, fn, resolve, reject });
      return this.run();
    });
  }

  run() {
    if (this.queue.length === 0) {
      return;
    }

    const start = Math.round(Date.now() / this.interval);
    const jobsInSameSecond = this.running.filter((job) => !job.end || start === job.end);
    const jobsRunning = this.running.filter((job) => !job.end);

    if (jobsRunning.length >= this.maxConcurrency) {
      return;
    }

    if (jobsInSameSecond.length >= this.maxPerInterval) {
      setTimeout(() => this.run(), this.interval);
      return;
    }

    const { id, fn, resolve, reject } = this.queue.shift()!;

    this.running.push({
      id,
      start
    });

    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        const runningJob = this.running.find((job) => job.id === id);
        const end = Math.round(Date.now() / this.interval);
        this.finished.push({
          ...runningJob,
          end
        });
        if (runningJob) {
          runningJob.end = end;
        }
        this.run();
      });
  }
}
