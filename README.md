# Rate Limiter

A client-side rate limiter that implements the fixed window algorithm. _(Other algorithms soon to be supported)_

## Table of Contents

<!-- toc -->

- [Problem](#problem)
- [Solution](#solution)
- [How to Use](#how-to-use)

<!-- tocstop -->

## Problem

Naturally, we aim to speed up our processes. When some tasks have the ability to execute concurrently or in-parallel,
we wish to take advantage of it. However, in some cases, we are limited to how many of these tasks we can execute
concurrently. E.g.: The API docs for an API that we are integrating states "up to 10 requests per second" are supported.
How will we ensure this while benefiting from concurrent task execution?

## Solution

A client-side rate limiter solves this problem. We define its limits and feed it our tasks. It can then handle concurrent
task execution while abiding by the limits we set in place. Other open source rate limiters, such as
[limiter](https://www.npmjs.com/package/limiter) either do not support both max concurrency control _and_ time-based rate
limiting, or they do not support all rate limiting algorithms. The goal of this library is to eventually support all
rate limiting algorithms, along with max concurrency control. (E.g. 10 tasks per second, but only 2 tasks at any given time).
Some APIs place limits on both tasks per interval _and_ concurrent tasks, which is why this is necessary. One example is the
[SmartRecruiters API](https://developers.smartrecruiters.com/docs/rate-limiting):

> For most endpoints, SmartAPIs allow up to 10 requests per second... [and] up to 8 concurrent requests.

## How to Use

```javascript
import RateLimiter from 'rate-limiter';

const rateLimiter = new RateLimiter({
  interval: 'second',
  maxPerInterval: 10,
  maxConcurrency: 10
});

// fake async task that takes 1 second
const makeAsyncTask = () => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
};

// add 10 tasks to the rate limiter
const tasks = [];
for (let i = 0; i < 10; i++) {
  tasks.push(rateLimiter.add(makeAsyncTask));
}

// check results of task execution
const results = await Promise.allSettled(tasks);
console.log(results);
// [
//   { status: 'fulfilled', value: 'success' },
//   { status: 'fulfilled', value: 'success' },
//   { status: 'fulfilled', value: 'success' },
//   { status: 'rejected', reason: Error: some error message }
// ]
```
