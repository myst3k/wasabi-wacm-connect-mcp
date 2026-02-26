import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { Invoice } from '../client/types.js';

export function registerInvoiceTools(server: McpServer, client: WacmClient): void {
  server.tool(
    'list_invoices',
    'List invoices for Sub-Accounts within your permissions. Includes storage costs, API call costs, and data transfer costs.',
    {
      page: z.number().int().positive().optional().describe('Page number (default: 1)'),
      size: z.number().int().positive().optional().describe('Items per page (default: 100)'),
      id: z.number().int().optional().describe('Filter by Invoice ID'),
      governanceAccountId: z.number().int().optional().describe('Filter by Governance Account ID'),
      controlAccountId: z.number().int().optional().describe('Filter by Control Account ID'),
      subAccountId: z.number().int().optional().describe('Filter by Sub-Account ID'),
      controlInvoiceId: z.number().int().optional().describe('Filter by Control Invoice ID'),
      subInvoiceId: z.number().int().optional().describe('Filter by Sub-Invoice ID'),
      latest: z.boolean().optional().describe('Retrieve only the latest invoice'),
      from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      to: z.string().optional().describe('End date (YYYY-MM-DD)'),
      wasabiAccountNumber: z.number().int().optional().describe('Filter by Wasabi account number'),
    },
    { readOnlyHint: true },
    async (params) => {
      const data = await client.list<Invoice>('/v1/invoices', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_invoice',
    'Get a specific invoice by ID with full billing breakdown including storage, API calls, egress, and ingress costs.',
    {
      invoiceId: z.number().int().describe('Invoice ID'),
    },
    { readOnlyHint: true },
    async ({ invoiceId }) => {
      const data = await client.get<Invoice>(`/v1/invoices/${invoiceId}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
