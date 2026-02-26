import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { Member } from '../client/types.js';

export function registerMemberWriteTools(
  server: McpServer,
  client: WacmClient,
  allowedOps: Set<string>,
): void {
  if (allowedOps.has('create_member')) {
    server.tool(
      'create_member',
      'Create a new member (Wasabi Console user) in a Sub-Account. Requires sub-account ID, user details, role, and password.',
      {
        subAccountId: z.number().int().describe('Sub-Account ID to add member to'),
        firstName: z.string().describe('First name'),
        lastName: z.string().describe('Last name'),
        username: z.string().describe('Login username'),
        memberRole: z
          .enum(['Admin', 'ReadWrite', 'ReadOnly'])
          .describe('Member role in the sub-account'),
        email: z.string().email().describe('Email address'),
        password: z.string().describe('Initial password'),
        address1: z.string().optional().describe('Address line 1'),
        address2: z.string().optional().describe('Address line 2'),
        country: z.string().optional().describe('Country'),
        city: z.string().optional().describe('City'),
        stateName: z.string().optional().describe('State/province'),
        zip: z.string().optional().describe('ZIP/postal code'),
        phone: z.string().optional().describe('Phone number'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false },
      async ({ dryRun, ...params }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview('POST', '/v1/members', params);
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.post<Member>('/v1/members', params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }

  if (allowedOps.has('update_member')) {
    server.tool(
      'update_member',
      'Update an existing Sub-Account member. Provide the member ID and any fields to modify.',
      {
        memberId: z.number().int().describe('Member ID to update'),
        firstName: z.string().optional().describe('First name'),
        lastName: z.string().optional().describe('Last name'),
        memberRole: z
          .enum(['Admin', 'ReadWrite', 'ReadOnly'])
          .optional()
          .describe('Member role'),
        email: z.string().email().optional().describe('Email address'),
        address1: z.string().optional().describe('Address line 1'),
        address2: z.string().optional().describe('Address line 2'),
        country: z.string().optional().describe('Country'),
        city: z.string().optional().describe('City'),
        stateName: z.string().optional().describe('State/province'),
        zip: z.string().optional().describe('ZIP/postal code'),
        phone: z.string().optional().describe('Phone number'),
        status: z.string().optional().describe('Member status'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false, idempotentHint: true },
      async ({ memberId, dryRun, ...params }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview(
            'PUT',
            `/v1/members/${memberId}`,
            params,
          );
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.put<Member>(`/v1/members/${memberId}`, params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }

  if (allowedOps.has('delete_member')) {
    server.tool(
      'delete_member',
      'Delete a Sub-Account member. This action is destructive and cannot be undone.',
      {
        memberId: z.number().int().describe('Member ID to delete'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false, destructiveHint: true },
      async ({ memberId, dryRun }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview('DELETE', `/v1/members/${memberId}`);
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.delete<Member>(`/v1/members/${memberId}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }
}
