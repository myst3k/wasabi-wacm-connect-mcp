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

  it('post() sends POST with JSON body', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 1, name: 'Created' } }),
    );

    const client = new WacmClient('user', 'key');
    const result = await client.post<{ id: number; name: string }>('/v1/test', {
      name: 'Created',
    });

    expect(result).toEqual({ id: 1, name: 'Created' });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({ name: 'Created' });
  });

  it('put() sends PUT with JSON body', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 1, name: 'Updated' } }),
    );

    const client = new WacmClient('user', 'key');
    await client.put('/v1/test/1', { name: 'Updated' });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ name: 'Updated' });
  });

  it('delete() sends DELETE without body', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 1 } }),
    );

    const client = new WacmClient('user', 'key');
    await client.delete('/v1/test/1');

    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('DELETE');
    expect(init.body).toBeUndefined();
  });

  it('buildRequestPreview returns preview without calling fetch', () => {
    const client = new WacmClient('user', 'key');
    const preview = client.buildRequestPreview('POST', '/v1/test', { name: 'Test' });

    expect(preview.method).toBe('POST');
    expect(preview.url).toContain('/v1/test');
    expect(preview.headers.Authorization).toBe('Basic [REDACTED]');
    expect(preview.headers['Content-Type']).toBe('application/json');
    expect(preview.body).toEqual({ name: 'Test' });
  });

  it('buildRequestPreview omits body and Content-Type for DELETE', () => {
    const client = new WacmClient('user', 'key');
    const preview = client.buildRequestPreview('DELETE', '/v1/test/1');

    expect(preview.method).toBe('DELETE');
    expect(preview.body).toBeUndefined();
    expect(preview.headers['Content-Type']).toBeUndefined();
  });
});
