import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { WacmClient } from '../client/wacm-client.js';
import type { ControlAccount, SubAccount, Country } from '../client/types.js';

const HIERARCHY_DOC = `# WACM Account Hierarchy

WACM organizes accounts into a four-tier hierarchy:

## 1. Governance Account (Top Level)
- Top-level account that manages multiple Control Accounts
- Procured through Wasabi Sales and the WACM AG product
- Has visibility into all accounts beneath it

## 2. Control Account
- Paying Wasabi account with billing information
- Manages Sub-Accounts and Channel Accounts
- Has storage quotas and billing contacts
- Can have API keys for programmatic access

## 3. Channel Account (Optional)
- Third-party access tier created by Control Account users
- Can create and manage Sub-Accounts
- Does not have its own Wasabi Console account
- Useful for resellers and MSP partners

## 4. Sub-Account (Bottom Level)
- Equivalent to a Wasabi Console account
- Creates billing and utilization records for all higher-tiered accounts
- Has its own storage buckets, access keys, and members
- Can have statuses: ON_TRIAL, PAID_ACCOUNT, SUSPENDED, DEACTIVATED

## Standalone Accounts
Standalone Accounts are Wasabi Console accounts signed up through the WACM Standalone Account Sign-Up Form. They are **not** attached to your WACM account hierarchy and are **not** billed through it.

## Relationships
- Governance → has many → Control Accounts
- Control Account → has many → Channel Accounts
- Control Account → has many → Sub-Accounts
- Channel Account → has many → Sub-Accounts
- Sub-Account → has many → Members
- Sub-Account → has many → Buckets
`;

export function registerResources(server: McpServer, client: WacmClient): void {
  server.resource('hierarchy', 'wacm://hierarchy', {
    description: 'WACM account hierarchy documentation explaining the 4-tier structure',
    mimeType: 'text/markdown',
  }, async () => ({
    contents: [
      {
        uri: 'wacm://hierarchy',
        mimeType: 'text/markdown',
        text: HIERARCHY_DOC,
      },
    ],
  }));

  server.resource(
    'control-account',
    new ResourceTemplate('wacm://control-accounts/{id}', { list: undefined }),
    { description: 'Control Account details by ID', mimeType: 'application/json' },
    async (uri, { id }) => {
      const data = await client.get<ControlAccount>(`/v1/control-accounts/${id}`);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );

  server.resource(
    'sub-account',
    new ResourceTemplate('wacm://sub-accounts/{id}', { list: undefined }),
    { description: 'Sub-Account details by ID', mimeType: 'application/json' },
    async (uri, { id }) => {
      const data = await client.get<SubAccount>(`/v1/sub-accounts/${id}`);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );

  server.resource('countries', 'wacm://reference/countries', {
    description: 'List of available country codes for account creation',
    mimeType: 'application/json',
  }, async () => {
    const data = await client.get<Country[]>('/v1/accounts/countries');
    return {
      contents: [
        {
          uri: 'wacm://reference/countries',
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  });
}
