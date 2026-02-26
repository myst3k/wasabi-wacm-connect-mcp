import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { WacmClient } from '../../src/client/wacm-client.js';
import { registerChannelAccountWriteTools } from '../../src/tools/channel-accounts-write.js';

describe('Channel Account Write Tools', () => {
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
    registerChannelAccountWriteTools(
      server,
      wacmClient,
      new Set(['create_channel_account', 'update_channel_account', 'delete_channel_account']),
    );

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'test-client', version: '0.0.1' });
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('create_channel_account sends POST with body', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 50, name: 'New Channel' } }),
    );

    await client.callTool({
      name: 'create_channel_account',
      arguments: {
        controlAccountId: 1,
        name: 'New Channel',
        contactEmail: 'ch@example.com',
        purchasedStorage: 10,
        storageQuotaType: 'Hard',
      },
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/v1/channel-accounts');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toMatchObject({ name: 'New Channel' });
  });

  it('create_channel_account dry run returns preview', async () => {
    const result = await client.callTool({
      name: 'create_channel_account',
      arguments: {
        controlAccountId: 1,
        name: 'New Channel',
        contactEmail: 'ch@example.com',
        purchasedStorage: 10,
        storageQuotaType: 'Hard',
        dryRun: true,
      },
    });

    expect(mockFetch).not.toHaveBeenCalled();
    const content = result.content[0];
    if (content.type === 'text') {
      const preview = JSON.parse(content.text);
      expect(preview.method).toBe('POST');
      expect(preview.headers.Authorization).toBe('Basic [REDACTED]');
    }
  });

  it('update_channel_account sends PUT', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 50, name: 'Updated' } }),
    );

    await client.callTool({
      name: 'update_channel_account',
      arguments: { channelAccountId: 50, name: 'Updated' },
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/v1/channel-accounts/50');
    expect(init.method).toBe('PUT');
  });

  it('delete_channel_account sends DELETE', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { id: 50 } }),
    );

    await client.callTool({
      name: 'delete_channel_account',
      arguments: { channelAccountId: 50 },
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/v1/channel-accounts/50');
    expect(init.method).toBe('DELETE');
  });
});
