import RateLimiter from '../src/RateLimiter';

function simulateAsyncTask(timeMs: number) {
  return function() {
    return new Promise<void>(async resolve => {
      setTimeout(() => {
        resolve();
      }, timeMs);
    });
  }
}

describe('ConcurrencyPool', () => {
  test.concurrent('1 task per second', async () => {
    // Given: A RateLimiter with a limit of 1 task per second
    const rateLimiter = new RateLimiter({
      interval: 'second',
      maxPerInterval: 1,
      maxConcurrency: 1
    });

    // When: 5 tasks are added to the RateLimiter
    const timeStart = Date.now();
    const tasks: Promise<any>[] = [];
    for (let i = 0; i < 5; i++) {
      tasks.push(
        rateLimiter.add(simulateAsyncTask(100))
      );
    }
    await Promise.all(tasks);
    const timeEnd = Date.now();
    const timeElapsed = timeEnd - timeStart;

    // Then: The tasks should be executed in ~ 4 seconds
    expect(timeElapsed).toBeGreaterThanOrEqual(4000)
    expect(timeElapsed).toBeLessThan(5000);
  }, 5000);

  test.concurrent('5 tasks per second', async () => {
    // Given: A RateLimiter with limit of 5 tasks per second
    const rateLimiter = new RateLimiter({
      interval: 'second',
      maxPerInterval: 5,
      maxConcurrency: 5
    });

    // When: 25 tasks are added to the RateLimiter
    const timeStart = Date.now();
    const tasks: Promise<any>[] = [];
    for (let i = 0; i < 25; i++) {
      tasks.push(
        rateLimiter.add(simulateAsyncTask(100))
      );
    }
    await Promise.all(tasks);
    const timeEnd = Date.now();
    const timeElapsed = timeEnd - timeStart;

    // Then: The tasks should be executed in ~ 4 seconds
    expect(timeElapsed).toBeGreaterThanOrEqual(4000)
    expect(timeElapsed).toBeLessThan(5000);
  }, 5000);

  test.concurrent('1 max concurrent tasks', async () => {
    // Given: A RateLimiter with a limit of 5 tasks
    // per second, with a max concurrency of 1
    const rateLimiter = new RateLimiter({
      interval: 'second',
      maxPerInterval: 5,
      maxConcurrency: 1
    });

    // When: 10 tasks are added to the RateLimiter
    const timeStart = Date.now();
    const tasks: Promise<any>[] = [];
    for (let i = 0; i < 10; i++) {
      tasks.push(
        rateLimiter.add(simulateAsyncTask(100))
      );
    }
    await Promise.all(tasks);
    const timeEnd = Date.now();
    const timeElapsed = timeEnd - timeStart;

    // Then: The tasks should be executed in ~ 2 seconds
    expect(timeElapsed).toBeGreaterThanOrEqual(2000)
    expect(timeElapsed).toBeLessThan(2500);
  }, 5000);

  test.concurrent('5 max concurrent tasks', async () => {
    // Given: A RateLimiter with a limit of 10 tasks
    // per second, with a max concurrency of 5
    const rateLimiter = new RateLimiter({
      interval: 'second',
      maxPerInterval: 10,
      maxConcurrency: 5
    });

    // When: 10 tasks are added to the RateLimiter
    const timeStart = Date.now();
    const tasks: Promise<any>[] = [];
    for (let i = 0; i < 10; i++) {
      tasks.push(
        rateLimiter.add(simulateAsyncTask(100))
      );
    }
    await Promise.all(tasks);
    const timeEnd = Date.now();
    const timeElapsed = timeEnd - timeStart;

    // Then: The tasks should be executed in ~ 0.2 seconds
    expect(timeElapsed).toBeGreaterThanOrEqual(200)
    expect(timeElapsed).toBeLessThan(300);
  }, 5000);
});
