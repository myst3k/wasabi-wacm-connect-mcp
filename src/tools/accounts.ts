import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { StandaloneAccount, StorageAmount } from '../client/types.js';

export function registerAccountTools(server: McpServer, client: WacmClient): void {
  server.tool(
    'list_standalone_accounts',
    'List Standalone Accounts created through the WACM Standalone Account Sign-Up Form. These accounts are not attached to your WACM hierarchy.',
    {
      page: z.number().int().positive().optional().describe('Page number (default: 1)'),
      size: z.number().int().positive().optional().describe('Items per page (default: 100)'),
      id: z.number().int().optional().describe('Filter by Standalone Account ID'),
      name: z.string().optional().describe('Filter by name'),
      email: z.string().optional().describe('Filter by email'),
      status: z.string().optional().describe('Filter by status'),
      wasabiAccountNumber: z.number().int().optional().describe('Filter by Wasabi account number'),
      partnerName: z.string().optional().describe('Filter by partner name'),
      storageAmount: z.string().optional().describe('Filter by projected storage amount'),
      companyName: z.string().optional().describe('Filter by company name'),
    },
    { readOnlyHint: true },
    async (params) => {
      const data = await client.list<StandaloneAccount>('/v1/accounts', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_storage_amounts',
    'Get the list of available storage amount options for Standalone Account sign-up.',
    {},
    { readOnlyHint: true },
    async () => {
      const data = await client.get<StorageAmount[]>('/v1/accounts/storage-amounts');
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
