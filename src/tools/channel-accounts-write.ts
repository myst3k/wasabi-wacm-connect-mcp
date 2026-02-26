import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { ChannelAccount } from '../client/types.js';

export function registerChannelAccountWriteTools(
  server: McpServer,
  client: WacmClient,
  allowedOps: Set<string>,
): void {
  if (allowedOps.has('create_channel_account')) {
    server.tool(
      'create_channel_account',
      'Create a new Channel Account under a Control Account. Channel Accounts provide third-party partners access to manage Sub-Accounts.',
      {
        controlAccountId: z.number().int().describe('Parent Control Account ID'),
        name: z.string().describe('Channel Account name'),
        contactEmail: z.string().email().describe('Primary contact email'),
        purchasedStorage: z.number().describe('Purchased storage allocation in TB'),
        storageQuotaType: z
          .enum(['Hard', 'Soft', 'None'])
          .describe('Storage quota enforcement type'),
        subAccountDefaultPurchasedStorage: z
          .number()
          .optional()
          .describe('Default storage for new sub-accounts in TB'),
        subAccountDefaultStorageQuotaType: z
          .enum(['Hard', 'Soft', 'None'])
          .optional()
          .describe('Default quota type for new sub-accounts'),
        address1: z.string().optional().describe('Address line 1'),
        address2: z.string().optional().describe('Address line 2'),
        country: z.string().optional().describe('Country'),
        city: z.string().optional().describe('City'),
        state: z.string().optional().describe('State/province'),
        zip: z.string().optional().describe('ZIP/postal code'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false },
      async ({ dryRun, ...params }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview('POST', '/v1/channel-accounts', params);
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.post<ChannelAccount>('/v1/channel-accounts', params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }

  if (allowedOps.has('update_channel_account')) {
    server.tool(
      'update_channel_account',
      'Update an existing Channel Account. Provide the channel account ID and any fields to modify.',
      {
        channelAccountId: z.number().int().describe('Channel Account ID to update'),
        name: z.string().optional().describe('Channel Account name'),
        contactEmail: z.string().email().optional().describe('Primary contact email'),
        purchasedStorage: z.number().optional().describe('Purchased storage in TB'),
        storageQuotaType: z
          .enum(['Hard', 'Soft', 'None'])
          .optional()
          .describe('Storage quota enforcement type'),
        subAccountDefaultPurchasedStorage: z
          .number()
          .optional()
          .describe('Default storage for new sub-accounts in TB'),
        subAccountDefaultStorageQuotaType: z
          .enum(['Hard', 'Soft', 'None'])
          .optional()
          .describe('Default quota type for new sub-accounts'),
        address1: z.string().optional().describe('Address line 1'),
        address2: z.string().optional().describe('Address line 2'),
        country: z.string().optional().describe('Country'),
        city: z.string().optional().describe('City'),
        state: z.string().optional().describe('State/province'),
        zip: z.string().optional().describe('ZIP/postal code'),
        status: z.string().optional().describe('Account status'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false, idempotentHint: true },
      async ({ channelAccountId, dryRun, ...params }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview(
            'PUT',
            `/v1/channel-accounts/${channelAccountId}`,
            params,
          );
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.put<ChannelAccount>(
          `/v1/channel-accounts/${channelAccountId}`,
          params,
        );
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }

  if (allowedOps.has('delete_channel_account')) {
    server.tool(
      'delete_channel_account',
      'Delete a Channel Account. This action is destructive and cannot be undone.',
      {
        channelAccountId: z.number().int().describe('Channel Account ID to delete'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false, destructiveHint: true },
      async ({ channelAccountId, dryRun }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview(
            'DELETE',
            `/v1/channel-accounts/${channelAccountId}`,
          );
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.delete<ChannelAccount>(
          `/v1/channel-accounts/${channelAccountId}`,
        );
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }
}
