import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { BucketUtilization, ControlAccount, Usage } from '../client/types.js';

export function registerControlAccountTools(server: McpServer, client: WacmClient): void {
  server.tool(
    'list_control_accounts',
    'List all Control Accounts within your permissions. Returns account details including storage allocation, sub-account counts, and billing information.',
    {
      page: z.number().int().positive().optional().describe('Page number (default: 1)'),
      size: z.number().int().positive().optional().describe('Items per page (default: 100)'),
      name: z.string().optional().describe('Filter by account name'),
      status: z
        .enum(['Active', 'Deactivated'])
        .optional()
        .describe('Filter by account status'),
      governanceAccountId: z.number().int().optional().describe('Filter by Governance Account ID'),
      id: z.number().int().optional().describe('Filter by Control Account ID'),
      controlAccountEmail: z.string().optional().describe('Filter by account email'),
      includeApiKey: z
        .boolean()
        .optional()
        .describe(
          'Include API keys in response. WARNING: Returns sensitive credentials. Defaults to false.',
        ),
      includeDeletedSubAccounts: z
        .boolean()
        .optional()
        .describe('Include deleted sub-accounts in counts'),
    },
    { readOnlyHint: true },
    async (params) => {
      const data = await client.list<ControlAccount>('/v1/control-accounts', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_control_account',
    'Get a specific Control Account by ID with detailed information including storage, billing, and sub-account counts.',
    {
      controlAccountId: z.number().int().describe('Control Account ID'),
      includeDeletedSubAccounts: z
        .boolean()
        .optional()
        .describe('Include deleted sub-accounts in counts'),
    },
    { readOnlyHint: true },
    async ({ controlAccountId, ...params }) => {
      const data = await client.get<ControlAccount>(
        `/v1/control-accounts/${controlAccountId}`,
        params,
      );
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'list_control_account_usages',
    'List aggregate usage data across Control Accounts. Returns daily metrics including storage, egress, ingress, and API calls.',
    {
      page: z.number().int().positive().optional().describe('Page number (default: 1)'),
      size: z.number().int().positive().optional().describe('Items per page (default: 100)'),
      governanceAccountId: z.number().int().optional().describe('Filter by Governance Account ID'),
      controlAccountId: z.number().int().optional().describe('Filter by Control Account ID'),
      subAccountId: z.number().int().optional().describe('Filter by Sub-Account ID'),
      latest: z.boolean().optional().describe('Retrieve only the latest usage record'),
      from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      to: z.string().optional().describe('End date (YYYY-MM-DD)'),
      wasabiAccountNumber: z.number().int().optional().describe('Filter by Wasabi account number'),
    },
    { readOnlyHint: true },
    async (params) => {
      const data = await client.list<Usage>('/v1/control-accounts/usages', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_control_account_usage',
    'Get a specific Control Account usage record by utilization ID.',
    {
      utilizationId: z.number().int().describe('Usage/Utilization ID'),
    },
    { readOnlyHint: true },
    async ({ utilizationId }) => {
      const data = await client.get<Usage>(`/v1/control-accounts/usages/${utilizationId}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'list_control_account_buckets',
    'List bucket-level utilization data for a Control Account. Returns per-bucket storage, egress, ingress, and API call metrics.',
    {
      controlAccountId: z.number().int().describe('Control Account ID'),
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
    async ({ controlAccountId, ...params }) => {
      const data = await client.list<BucketUtilization>(
        `/v1/control-accounts/${controlAccountId}/buckets`,
        params,
      );
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
