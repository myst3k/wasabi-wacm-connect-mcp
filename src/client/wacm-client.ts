import { RateLimiter } from './rate-limiter.js';
import type { ApiEnvelope, PaginatedData } from './types.js';

const BASE_URL = 'https://api.wacm.wasabisys.com/api';

export class WacmApiError extends Error {
  constructor(
    public statusCode: number,
    public apiMessage: string,
    public apiCode?: string,
  ) {
    super(`WACM API error ${statusCode}: ${apiMessage}`);
    this.name = 'WacmApiError';
  }
}

export class WacmClient {
  private authHeader: string;
  private rateLimiter: RateLimiter;

  constructor(username: string, apiKey: string) {
    this.authHeader = 'Basic ' + Buffer.from(`${username}:${apiKey}`).toString('base64');
    this.rateLimiter = new RateLimiter(5, 5);
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    await this.rateLimiter.acquire();

    const url = this.buildUrl(path, params);
    let response = await fetch(url, {
      headers: { Authorization: this.authHeader },
    });

    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.rateLimiter.acquire();
      response = await fetch(url, {
        headers: { Authorization: this.authHeader },
      });
    }

    if (!response.ok) {
      const body = await response.text();
      let message = body;
      let code: string | undefined;
      try {
        const parsed = JSON.parse(body);
        message = parsed.message || body;
        code = parsed.code;
      } catch {
        // use raw body as message
      }
      throw new WacmApiError(response.status, message, code);
    }

    const envelope = (await response.json()) as ApiEnvelope<T>;
    if (!envelope.success) {
      throw new WacmApiError(200, envelope.message, envelope.code);
    }

    return envelope.data;
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>(path, params);
  }

  async list<T>(path: string, params?: Record<string, unknown>): Promise<PaginatedData<T>> {
    return this.request<PaginatedData<T>>(path, params);
  }
}
