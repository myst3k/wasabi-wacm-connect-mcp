import { describe, it, expect } from 'vitest';
import { RateLimiter } from '../../src/client/rate-limiter.js';

describe('RateLimiter', () => {
  it('allows requests up to the token limit without waiting', async () => {
    const limiter = new RateLimiter(3, 3);
    const start = Date.now();

    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  it('delays when tokens are exhausted', async () => {
    const limiter = new RateLimiter(1, 5);

    await limiter.acquire();
    const start = Date.now();
    await limiter.acquire();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(100);
  });

  it('refills tokens over time', async () => {
    const limiter = new RateLimiter(2, 10);

    await limiter.acquire();
    await limiter.acquire();

    await new Promise((resolve) => setTimeout(resolve, 250));

    const start = Date.now();
    await limiter.acquire();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(50);
  });
});
