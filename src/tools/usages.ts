import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { SubAccountUsage } from '../client/types.js';

export function registerUsageTools(server: McpServer, client: WacmClient): void {
  server.tool(
    'list_usages',
    'List Sub-Account level usage data. Returns daily metrics including storage, egress, ingress, and API calls per Sub-Account.',
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
      const data = await client.list<SubAccountUsage>('/v1/usages', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_usage',
    'Get a specific Sub-Account usage record by utilization ID with full daily metrics.',
    {
      utilizationId: z.number().int().describe('Usage/Utilization ID'),
    },
    { readOnlyHint: true },
    async ({ utilizationId }) => {
      const data = await client.get<SubAccountUsage>(`/v1/usages/${utilizationId}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
