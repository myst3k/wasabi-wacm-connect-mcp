import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { BucketUtilization, SubAccount } from '../client/types.js';

export function registerSubAccountTools(server: McpServer, client: WacmClient): void {
  server.tool(
    'list_sub_accounts',
    'List all Sub-Accounts (Wasabi Console accounts) within your permissions. Returns account details, storage allocation, and parent account information.',
    {
      page: z.number().int().positive().optional().describe('Page number (default: 1)'),
      size: z.number().int().positive().optional().describe('Items per page (default: 100)'),
      id: z.number().int().optional().describe('Filter by Sub-Account ID'),
      name: z.string().optional().describe('Filter by account name'),
      controlAccountId: z.number().int().optional().describe('Filter by Control Account ID'),
      governanceAccountId: z.number().int().optional().describe('Filter by Governance Account ID'),
      status: z
        .enum(['ON_TRIAL', 'PAID_ACCOUNT', 'SUSPENDED', 'DEACTIVATED'])
        .optional()
        .describe('Filter by account status'),
      wasabiAccountName: z.string().optional().describe('Filter by Wasabi account name/email'),
      wasabiAccountNumber: z.number().int().optional().describe('Filter by Wasabi account number'),
      includeDeleted: z.boolean().optional().describe('Include deleted sub-accounts'),
      includeKeys: z
        .boolean()
        .optional()
        .describe(
          'Include access/secret keys in response. WARNING: Returns sensitive credentials. Defaults to false.',
        ),
    },
    { readOnlyHint: true },
    async (params) => {
      const data = await client.list<SubAccount>('/v1/sub-accounts', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_sub_account',
    'Get a specific Sub-Account by ID with detailed information including storage, keys (if requested), and parent account hierarchy.',
    {
      subAccountId: z.number().int().describe('Sub-Account ID'),
      includeDeleted: z.boolean().optional().describe('Include if sub-account is deleted'),
      includeKeys: z
        .boolean()
        .optional()
        .describe(
          'Include access/secret keys in response. WARNING: Returns sensitive credentials. Defaults to false.',
        ),
    },
    { readOnlyHint: true },
    async ({ subAccountId, ...params }) => {
      const data = await client.get<SubAccount>(`/v1/sub-accounts/${subAccountId}`, params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'list_sub_account_buckets',
    'List bucket-level utilization data for a Sub-Account. Returns per-bucket storage, egress, ingress, and API call metrics.',
    {
      subAccountId: z.number().int().describe('Sub-Account ID'),
      page: z.number().int().positive().optional().describe('Page number (default: 1)'),
      size: z.number().int().positive().optional().describe('Items per page (default: 100)'),
      from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      to: z.string().optional().describe('End date (YYYY-MM-DD)'),
      latest: z.boolean().optional().describe('Retrieve only the latest bucket utilization'),
      name: z.string().optional().describe('Filter by bucket name'),
      bucketNumber: z.number().int().optional().describe('Filter by bucket number'),
      region: z.string().optional().describe('Filter by region'),
    },
    { readOnlyHint: true },
    async ({ subAccountId, ...params }) => {
      const data = await client.list<BucketUtilization>(
        `/v1/sub-accounts/${subAccountId}/buckets`,
        params,
      );
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
