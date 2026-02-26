import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WacmClient, WacmApiError } from '../../src/client/wacm-client.js';

describe('WacmClient', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function jsonResponse(data: unknown, status = 200): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as unknown as Response;
  }

  it('sends Basic Auth header', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 1 } }),
    );

    const client = new WacmClient('user', 'key123');
    await client.get('/v1/test');

    const [, init] = mockFetch.mock.calls[0];
    const expected = 'Basic ' + Buffer.from('user:key123').toString('base64');
    expect(init.headers.Authorization).toBe(expected);
  });

  it('unwraps the API envelope on success', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, message: 'OK', data: { id: 42, name: 'Test' } }),
    );

    const client = new WacmClient('user', 'key');
    const result = await client.get<{ id: number; name: string }>('/v1/test');

    expect(result).toEqual({ id: 42, name: 'Test' });
  });

  it('throws WacmApiError on unsuccessful envelope', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ success: false, code: 'ERR-001', message: 'Not found' }),
    );

    const client = new WacmClient('user', 'key');
    await expect(client.get('/v1/test')).rejects.toThrow(WacmApiError);
    await expect(client.get('/v1/test')).rejects.toThrow('Not found');
  });

  it('throws WacmApiError on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: 'Unauthorized' }, 401),
    );

    const client = new WacmClient('user', 'badkey');
    await expect(client.get('/v1/test')).rejects.toThrow(WacmApiError);
  });

  it('retries once on HTTP 429', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(
        jsonResponse({ success: true, data: { id: 1 } }),
      );

    const client = new WacmClient('user', 'key');
    const result = await client.get<{ id: number }>('/v1/test');

    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('strips undefined params from query string', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { items: [], page: 1, size: 10, total: 0 } }),
    );

    const client = new WacmClient('user', 'key');
    await client.list('/v1/test', { page: 1, size: undefined, name: 'hello' });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('page=1');
    expect(url).toContain('name=hello');
    expect(url).not.toContain('size');
  });

  it('returns paginated data from list()', async () => {
    const payload = {
      success: true,
      data: {
        items: [{ id: 1 }, { id: 2 }],
        page: 1,
        size: 10,
        total: 2,
      },
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(payload));

    const client = new WacmClient('user', 'key');
    const result = await client.list<{ id: number }>('/v1/test');

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
  });
});
