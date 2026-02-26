import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { SubAccount } from '../client/types.js';

export function registerSubAccountWriteTools(
  server: McpServer,
  client: WacmClient,
  allowedOps: Set<string>,
): void {
  if (allowedOps.has('create_sub_account')) {
    server.tool(
      'create_sub_account',
      'Create a new Sub-Account (Wasabi Console account) under a Control Account. Requires account name, email, password, and storage quota type.',
      {
        controlAccountId: z.number().int().describe('Parent Control Account ID'),
        name: z.string().describe('Sub-Account name'),
        wasabiAccountEmail: z.string().email().describe('Email for the Wasabi account'),
        password: z.string().describe('Initial password for the account'),
        storageQuotaType: z
          .enum(['Hard', 'Soft', 'None'])
          .describe('Storage quota enforcement type'),
        channelAccountId: z.number().int().optional().describe('Optional Channel Account ID'),
        purchasedStorageTB: z.number().optional().describe('Purchased storage in TB'),
        sendPasswordResetToSubAccount: z
          .boolean()
          .optional()
          .describe('Send password reset email to new account'),
        ftpEnabled: z.boolean().optional().describe('Enable FTP access'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false },
      async ({ dryRun, ...params }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview('POST', '/v1/sub-accounts', params);
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.post<SubAccount>('/v1/sub-accounts', params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }

  if (allowedOps.has('update_sub_account')) {
    server.tool(
      'update_sub_account',
      'Update an existing Sub-Account. Provide the sub-account ID and any fields to modify.',
      {
        subAccountId: z.number().int().describe('Sub-Account ID to update'),
        name: z.string().optional().describe('New account name'),
        storageQuotaType: z
          .enum(['Hard', 'Soft', 'None'])
          .optional()
          .describe('Storage quota enforcement type'),
        purchasedStorageTB: z.number().optional().describe('Purchased storage in TB'),
        sendPasswordResetToSubAccount: z
          .boolean()
          .optional()
          .describe('Send password reset email'),
        ftpEnabled: z.boolean().optional().describe('Enable/disable FTP access'),
        status: z.string().optional().describe('Account status'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false, idempotentHint: true },
      async ({ subAccountId, dryRun, ...params }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview(
            'PUT',
            `/v1/sub-accounts/${subAccountId}`,
            params,
          );
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.put<SubAccount>(
          `/v1/sub-accounts/${subAccountId}`,
          params,
        );
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }

  if (allowedOps.has('delete_sub_account')) {
    server.tool(
      'delete_sub_account',
      'Delete a Sub-Account. This action is destructive and cannot be undone.',
      {
        subAccountId: z.number().int().describe('Sub-Account ID to delete'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false, destructiveHint: true },
      async ({ subAccountId, dryRun }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview(
            'DELETE',
            `/v1/sub-accounts/${subAccountId}`,
          );
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.delete<SubAccount>(`/v1/sub-accounts/${subAccountId}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }
}
