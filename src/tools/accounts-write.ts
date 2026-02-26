import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WacmClient } from '../client/wacm-client.js';
import type { StandaloneAccount } from '../client/types.js';

export function registerAccountWriteTools(
  server: McpServer,
  client: WacmClient,
  allowedOps: Set<string>,
): void {
  if (allowedOps.has('create_standalone_account')) {
    server.tool(
      'create_standalone_account',
      'Create a new Standalone Account through the WACM Standalone Account Sign-Up. These accounts are not attached to your WACM hierarchy.',
      {
        firstName: z.string().describe('First name'),
        lastName: z.string().describe('Last name'),
        companyName: z.string().describe('Company name'),
        email: z.string().email().describe('Email address'),
        country: z.string().describe('Country code'),
        phoneNumber: z.string().describe('Phone number'),
        storageAmount: z.string().describe('Projected storage amount (use get_storage_amounts for options)'),
        dryRun: z
          .boolean()
          .optional()
          .default(false)
          .describe('Preview the request without executing it'),
      },
      { readOnlyHint: false },
      async ({ dryRun, ...params }) => {
        if (dryRun) {
          const preview = client.buildRequestPreview('POST', '/v1/accounts', params);
          return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const data = await client.post<StandaloneAccount>('/v1/accounts', params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      },
    );
  }
}
