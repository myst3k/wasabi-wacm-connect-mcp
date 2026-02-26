import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';

export function registerChannelAccountUserWriteTools(
  server: McpServer,
  client: WacmClient,
  allowedOps: Set<string>,
): void {
  if (allowedOps.has('create_channel_account_user')) {
    server.tool(
      'create_channel_account_user',
      'Create a new user for a Channel Account. Users can manage the channel account and its sub-accounts based on their role.',
      {
        channelAccountId: z.number().int().describe('Channel Account ID'),
        firstName: z.string().describe('First name'),
        lastName: z.string().describe('Last name'),
        email: z.string().email().describe('Email address'),
        userRole: z.string().describe('User role in the channel account'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false },
      async ({ dryRun, ...params }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview(
            'POST',
            '/v1/channel-accounts/users',
            params,
          );
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.post('/v1/channel-accounts/users', params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }

  if (allowedOps.has('delete_channel_account_user')) {
    server.tool(
      'delete_channel_account_user',
      'Delete a Channel Account user. This action is destructive and cannot be undone.',
      {
        userId: z.number().int().describe('Channel Account User ID to delete'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false, destructiveHint: true },
      async ({ userId, dryRun }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview(
            'DELETE',
            `/v1/channel-accounts/users/${userId}`,
          );
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.delete(`/v1/channel-accounts/users/${userId}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }
}
