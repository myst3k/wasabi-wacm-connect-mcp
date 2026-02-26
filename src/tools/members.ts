import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { Member } from '../client/types.js';

export function registerMemberTools(server: McpServer, client: WacmClient): void {
  server.tool(
    'list_members',
    'List all Sub-Account members (Wasabi Console users) within your permissions. Returns user details, roles, and MFA status.',
    {
      page: z.number().int().positive().optional().describe('Page number (default: 1)'),
      size: z.number().int().positive().optional().describe('Items per page (default: 100)'),
      id: z.number().int().optional().describe('Filter by Member ID'),
      status: z
        .enum(['Active', 'Deactivated'])
        .optional()
        .describe('Filter by member status'),
      username: z.string().optional().describe('Filter by username'),
      subAccountId: z.number().int().optional().describe('Filter by Sub-Account ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const data = await client.list<Member>('/v1/members', params);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get_member',
    'Get a specific Sub-Account member by ID with detailed profile, role, and security information.',
    {
      memberId: z.number().int().describe('Member ID'),
    },
    { readOnlyHint: true },
    async ({ memberId }) => {
      const data = await client.get<Member>(`/v1/members/${memberId}`);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );
}
