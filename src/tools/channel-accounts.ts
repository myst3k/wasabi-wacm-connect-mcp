import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { ChannelAccount } from '../client/types.js';

export function registerChannelAccountTools(server: McpServer, client: WacmClient): void {
  server.tool(
    'list_channel_accounts',
    'List all Channel Accounts within your permissions. Channel Accounts provide third-party access to manage Sub-Accounts.',
    {
      page: z.number().int().positive().optional().describe('Page number (default: 1)'),
      size: z.number().int().positive().optional().describe('Items per page (default: 100)'),
      id: z.number().int().optional().describe('Filter by Channel Account ID'),
      status: z
        .enum(['Active', 'Deactivated'])
        .optional()
        .describe('Filter by status'),
      name: z.string().optional().describe('Filter by Channel Account name'),
      contactEmail: z.string().optional().describe('Filter by contact email'),
      controlAccountId: z.number().int().optional().describe('Filter by Control Account ID'),
      includeDeletedSubAccounts: z
        .boolean()
        .optional()
        .describe('Include deleted sub-accounts in counts'),
    },
    { readOnlyHint: true },
    async (params) => {
      const data = await client.list<ChannelAccount>('/v1/channel-accounts', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_channel_account',
    'Get a specific Channel Account by ID with detailed information including storage allocation, sub-account counts, and address details.',
    {
      channelAccountId: z.number().int().describe('Channel Account ID'),
      includeDeletedSubAccounts: z
        .boolean()
        .optional()
        .describe('Include deleted sub-accounts in counts'),
    },
    { readOnlyHint: true },
    async ({ channelAccountId, ...params }) => {
      const data = await client.get<ChannelAccount>(
        `/v1/channel-accounts/${channelAccountId}`,
        params,
      );
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
