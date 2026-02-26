import { describe, it, expect, vi, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';

describe('Server conditional tool registration', () => {
  const mockFetch = vi.fn();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function connectAndListTools(allowedWriteOps: Set<string> = new Set()): Promise<string[]> {
    vi.stubGlobal('fetch', mockFetch);
    const server = createServer('user', 'key', allowedWriteOps);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: 'test-client', version: '0.0.1' });
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
    const { tools } = await client.listTools();
    return tools.map((t) => t.name);
  }

  it('registers only 18 read-only tools with no write ops', async () => {
    const tools = await connectAndListTools();
    expect(tools).toHaveLength(18);
    expect(tools).not.toContain('create_sub_account');
  });

  it('registers all 30 tools with WACM_WRITE_LEVEL=full', async () => {
    const fullOps = new Set([
      'create_sub_account', 'update_sub_account', 'delete_sub_account',
      'create_member', 'update_member', 'delete_member',
      'create_channel_account', 'update_channel_account', 'delete_channel_account',
      'create_channel_account_user', 'delete_channel_account_user',
      'create_standalone_account',
    ]);
    const tools = await connectAndListTools(fullOps);
    expect(tools).toHaveLength(30);
    expect(tools).toContain('create_sub_account');
    expect(tools).toContain('delete_member');
    expect(tools).toContain('create_standalone_account');
  });

  it('registers 23 tools with create-tier ops', async () => {
    const createOps = new Set([
      'create_sub_account',
      'create_member',
      'create_channel_account',
      'create_channel_account_user',
      'create_standalone_account',
    ]);
    const tools = await connectAndListTools(createOps);
    expect(tools).toHaveLength(23);
    expect(tools).toContain('create_sub_account');
    expect(tools).not.toContain('update_sub_account');
    expect(tools).not.toContain('delete_sub_account');
  });

  it('registers correct union when combining tier + explicit ops', async () => {
    const unionOps = new Set([
      'create_sub_account',
      'create_member',
      'create_channel_account',
      'create_channel_account_user',
      'create_standalone_account',
      'update_sub_account',
      'update_member',
      'update_channel_account',
      'delete_member',
    ]);
    const tools = await connectAndListTools(unionOps);
    expect(tools).toHaveLength(27);
    expect(tools).toContain('delete_member');
    expect(tools).toContain('update_sub_account');
    expect(tools).not.toContain('delete_sub_account');
  });
});
