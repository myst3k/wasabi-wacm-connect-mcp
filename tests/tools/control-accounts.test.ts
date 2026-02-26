import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { WacmClient } from '../../src/client/wacm-client.js';
import { registerControlAccountTools } from '../../src/tools/control-accounts.js';

describe('Control Account Tools', () => {
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
    registerControlAccountTools(server, wacmClient);

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'test-client', version: '0.0.1' });

    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('list_control_accounts returns paginated data', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          items: [{ id: 1, name: 'Test Control' }],
          page: 1,
          size: 100,
          total: 1,
        },
      }),
    );

    const result = await client.callTool({
      name: 'list_control_accounts',
      arguments: { page: 1, size: 100 },
    });

    expect(result.content).toHaveLength(1);
    const content = result.content[0];
    expect(content).toHaveProperty('type', 'text');
    if (content.type === 'text') {
      const parsed = JSON.parse(content.text);
      expect(parsed.items).toHaveLength(1);
      expect(parsed.items[0].name).toBe('Test Control');
    }
  });

  it('get_control_account returns account details', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { id: 42, name: 'My Control Account', status: 'Active' },
      }),
    );

    const result = await client.callTool({
      name: 'get_control_account',
      arguments: { controlAccountId: 42 },
    });

    const content = result.content[0];
    if (content.type === 'text') {
      const parsed = JSON.parse(content.text);
      expect(parsed.id).toBe(42);
      expect(parsed.name).toBe('My Control Account');
    }
  });

  it('list_control_account_usages passes date filters', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { items: [], page: 1, size: 100, total: 0 },
      }),
    );

    await client.callTool({
      name: 'list_control_account_usages',
      arguments: { from: '2025-01-01', to: '2025-01-31', latest: true },
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('from=2025-01-01');
    expect(url).toContain('to=2025-01-31');
    expect(url).toContain('latest=true');
  });
});
