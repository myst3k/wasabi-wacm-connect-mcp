import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { WacmClient } from '../../src/client/wacm-client.js';
import { registerSubAccountTools } from '../../src/tools/sub-accounts.js';

describe('Sub-Account Tools', () => {
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
    registerSubAccountTools(server, wacmClient);

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'test-client', version: '0.0.1' });

    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('list_sub_accounts returns paginated data', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          items: [{ id: 10, name: 'Test Sub', status: 'PAID_ACCOUNT' }],
          page: 1,
          size: 100,
          total: 1,
        },
      }),
    );

    const result = await client.callTool({
      name: 'list_sub_accounts',
      arguments: {},
    });

    const content = result.content[0];
    if (content.type === 'text') {
      const parsed = JSON.parse(content.text);
      expect(parsed.items[0].name).toBe('Test Sub');
    }
  });

  it('get_sub_account passes includeKeys parameter', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { id: 10, name: 'Test Sub', accessKey: 'AK123', secretKey: 'SK456' },
      }),
    );

    await client.callTool({
      name: 'get_sub_account',
      arguments: { subAccountId: 10, includeKeys: true },
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('includeKeys=true');
  });

  it('list_sub_account_buckets filters by date range', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { items: [], page: 1, size: 100, total: 0 },
      }),
    );

    await client.callTool({
      name: 'list_sub_account_buckets',
      arguments: { subAccountId: 10, from: '2025-01-01', to: '2025-01-31' },
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/sub-accounts/10/buckets');
    expect(url).toContain('from=2025-01-01');
  });
});
