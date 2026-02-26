import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer): void {
  server.prompt(
    'storage-summary',
    'Summarize storage usage across all accounts, highlighting accounts near quota limits',
    {
      controlAccountId: z
        .string()
        .optional()
        .describe('Optional Control Account ID to scope the summary'),
    },
    ({ controlAccountId }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Provide a storage usage summary for my WACM accounts.',
              controlAccountId
                ? `Focus on Control Account ID: ${controlAccountId}.`
                : 'Include all Control Accounts.',
              '',
              'Steps:',
              '1. Use list_control_accounts to get all control accounts',
              '2. Use list_sub_accounts to get sub-accounts for each control account',
              '3. Compare activeStorage and deletedStorage against purchasedStorageTB quotas',
              '',
              'Format the results as a table with columns:',
              '- Account Name',
              '- Account Type (Control/Sub)',
              '- Active Storage (TB)',
              '- Deleted Storage (TB)',
              '- Quota (TB)',
              '- Usage %',
              '',
              'Highlight any accounts using more than 80% of their quota.',
              'Flag any accounts that have exceeded their quota.',
              'Include a summary with total storage used vs total allocated.',
            ].join('\n'),
          },
        },
      ],
    }),
  );

  server.prompt(
    'billing-report',
    'Generate a monthly billing breakdown by sub-account with cost analysis',
    {
      from: z.string().describe('Start date (YYYY-MM-DD)'),
      to: z.string().describe('End date (YYYY-MM-DD)'),
      controlAccountId: z
        .string()
        .optional()
        .describe('Optional Control Account ID to filter invoices'),
    },
    ({ from, to, controlAccountId }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Generate a billing report for the period ${from} to ${to}.`,
              controlAccountId
                ? `Filter to Control Account ID: ${controlAccountId}.`
                : 'Include all accounts.',
              '',
              'Steps:',
              '1. Use list_invoices with the from/to date range to get all invoices',
              '2. Group invoices by sub-account',
              '',
              'For each sub-account, show:',
              '- Sub-Account Name and ID',
              '- Active Storage Cost',
              '- Deleted Storage Cost',
              '- API Calls Cost',
              '- Egress Cost',
              '- Ingress Cost',
              '- Total Cost',
              '',
              'Include totals for each cost category.',
              'Identify the top 3 most expensive sub-accounts.',
              'Note any unusual cost patterns (e.g., high egress relative to storage).',
            ].join('\n'),
          },
        },
      ],
    }),
  );

  server.prompt(
    'account-audit',
    'Audit the account hierarchy, flagging deactivated, insecure, or misconfigured accounts',
    {
      controlAccountId: z
        .string()
        .optional()
        .describe('Optional Control Account ID to scope the audit'),
    },
    ({ controlAccountId }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Perform a security and configuration audit of my WACM account hierarchy.',
              controlAccountId
                ? `Focus on Control Account ID: ${controlAccountId}.`
                : 'Audit all accounts.',
              '',
              'Steps:',
              '1. Use list_control_accounts to enumerate control accounts',
              '2. Use list_channel_accounts to enumerate channel accounts',
              '3. Use list_sub_accounts to enumerate sub-accounts',
              '4. Use list_members to check member security settings',
              '',
              'Check for and report:',
              '- Deactivated accounts that may need cleanup',
              '- Members without MFA enabled',
              '- SSO configuration status across accounts',
              '- Accounts with soft quota that are over-provisioned',
              '- Channel accounts with no active sub-accounts',
              '- Sub-accounts with ON_TRIAL or SUSPENDED status',
              '',
              'Provide findings grouped by severity: Critical, Warning, Info.',
              'Include remediation suggestions for each finding.',
            ].join('\n'),
          },
        },
      ],
    }),
  );

  server.prompt(
    'usage-trend',
    'Analyze usage trends over time for a specific sub-account',
    {
      subAccountId: z.string().describe('Sub-Account ID to analyze'),
      from: z.string().describe('Start date (YYYY-MM-DD)'),
      to: z.string().describe('End date (YYYY-MM-DD)'),
    },
    ({ subAccountId, from, to }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Analyze usage trends for Sub-Account ID: ${subAccountId} from ${from} to ${to}.`,
              '',
              'Steps:',
              '1. Use get_sub_account to get account details and quota',
              '2. Use list_usages with subAccountId, from, and to to get daily usage data',
              '',
              'Analyze and present:',
              '- Storage growth trend (active + deleted storage over time)',
              '- Data transfer patterns (egress vs ingress over time)',
              '- API call volume trends',
              '- Object count changes',
              '',
              'Calculate:',
              '- Average daily storage growth rate',
              '- Peak vs average egress',
              '- Projected storage at current growth rate (30/60/90 days)',
              '- Days until quota is reached at current growth rate',
              '',
              'Highlight any anomalies or sudden changes in usage patterns.',
            ].join('\n'),
          },
        },
      ],
    }),
  );

  server.prompt(
    'bucket-analysis',
    'Analyze bucket utilization to find largest, most active, and underutilized buckets',
    {
      accountId: z.string().describe('Control Account or Sub-Account ID'),
      accountType: z
        .enum(['control', 'sub'])
        .describe('Whether the ID is a Control Account or Sub-Account'),
    },
    ({ accountId, accountType }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Analyze bucket utilization for ${accountType === 'control' ? 'Control' : 'Sub-'}Account ID: ${accountId}.`,
              '',
              'Steps:',
              `1. Use list_${accountType === 'control' ? 'control_account' : 'sub_account'}_buckets with latest=true to get current bucket data`,
              '2. Get historical data by calling without latest to see trends',
              '',
              'Provide:',
              '- Top 10 largest buckets by active storage',
              '- Top 10 most active buckets by API calls',
              '- Top 10 buckets by egress (potential cost drivers)',
              '- Buckets with deleted storage (pending cleanup)',
              '- Buckets with zero or near-zero activity (candidates for archival)',
              '- Distribution of buckets across regions',
              '',
              'Include a summary with:',
              '- Total number of buckets',
              '- Total storage across all buckets',
              '- Average bucket size',
              '- Storage concentration (% held by top 10 buckets)',
            ].join('\n'),
          },
        },
      ],
    }),
  );
}
