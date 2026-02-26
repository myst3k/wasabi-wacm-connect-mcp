import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { WacmClient } from '../../src/client/wacm-client.js';
import { registerSubAccountWriteTools } from '../../src/tools/sub-accounts-write.js';

describe('Sub-Account Write Tools', () => {
  let client: Client;
  const mockFetch = vi.fn();

  function jsonResponse(data: unknown): Response {
    return {
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as unknown as Response;
  }

  beforeEach(async () => {
    vi.stubGlobal('fetch', mockFetch);

    const server = new McpServer({ name: 'test', version: '0.0.1' });
    const wacmClient = new WacmClient('user', 'key');
    registerSubAccountWriteTools(
      server,
      wacmClient,
      new Set(['create_sub_account', 'update_sub_account', 'delete_sub_account']),
    );

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'test-client', version: '0.0.1' });
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('create_sub_account sends POST with body', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 100, name: 'New Sub' } }),
    );

    const result = await client.callTool({
      name: 'create_sub_account',
      arguments: {
        controlAccountId: 1,
        name: 'New Sub',
        wasabiAccountEmail: 'test@example.com',
        password: 'securepass',
        storageQuotaType: 'Hard',
      },
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/v1/sub-accounts');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toMatchObject({ name: 'New Sub' });

    const content = result.content[0];
    if (content.type === 'text') {
      expect(JSON.parse(content.text).id).toBe(100);
    }
  });

  it('create_sub_account dry run returns preview without calling API', async () => {
    const result = await client.callTool({
      name: 'create_sub_account',
      arguments: {
        controlAccountId: 1,
        name: 'New Sub',
        wasabiAccountEmail: 'test@example.com',
        password: 'securepass',
        storageQuotaType: 'Hard',
        dryRun: true,
      },
    });

    expect(mockFetch).not.toHaveBeenCalled();

    const content = result.content[0];
    if (content.type === 'text') {
      const preview = JSON.parse(content.text);
      expect(preview.method).toBe('POST');
      expect(preview.url).toContain('/v1/sub-accounts');
      expect(preview.headers.Authorization).toBe('Basic [REDACTED]');
      expect(preview.body.name).toBe('New Sub');
    }
  });

  it('update_sub_account sends PUT with body', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 10, name: 'Updated' } }),
    );

    await client.callTool({
      name: 'update_sub_account',
      arguments: { subAccountId: 10, name: 'Updated' },
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/v1/sub-accounts/10');
    expect(init.method).toBe('PUT');
  });

  it('delete_sub_account sends DELETE', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 10 } }),
    );

    await client.callTool({
      name: 'delete_sub_account',
      arguments: { subAccountId: 10 },
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/v1/sub-accounts/10');
    expect(init.method).toBe('DELETE');
  });

  it('delete_sub_account dry run returns preview', async () => {
    const result = await client.callTool({
      name: 'delete_sub_account',
      arguments: { subAccountId: 10, dryRun: true },
    });

    expect(mockFetch).not.toHaveBeenCalled();
    const content = result.content[0];
    if (content.type === 'text') {
      const preview = JSON.parse(content.text);
      expect(preview.method).toBe('DELETE');
      expect(preview.url).toContain('/v1/sub-accounts/10');
    }
  });
});
