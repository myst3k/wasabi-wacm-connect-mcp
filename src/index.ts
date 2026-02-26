#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

const ALL_WRITE_OPS = new Set([
  'create_sub_account',
  'update_sub_account',
  'delete_sub_account',
  'create_member',
  'update_member',
  'delete_member',
  'create_channel_account',
  'update_channel_account',
  'delete_channel_account',
  'create_channel_account_user',
  'delete_channel_account_user',
  'create_standalone_account',
]);

const TIER_OPS: Record<string, string[]> = {
  create: [
    'create_sub_account',
    'create_member',
    'create_channel_account',
    'create_channel_account_user',
    'create_standalone_account',
  ],
  manage: [
    'create_sub_account',
    'create_member',
    'create_channel_account',
    'create_channel_account_user',
    'create_standalone_account',
    'update_sub_account',
    'update_member',
    'update_channel_account',
  ],
  full: [...ALL_WRITE_OPS],
};

function resolveWriteOps(): Set<string> {
  const ops = new Set<string>();

  const level = process.env.WACM_WRITE_LEVEL?.toLowerCase();
  if (level) {
    const tierOps = TIER_OPS[level];
    if (tierOps) {
      for (const op of tierOps) ops.add(op);
    } else {
      console.error(`Warning: unknown WACM_WRITE_LEVEL "${level}" — ignoring`);
    }
  }

  const explicit = process.env.WACM_WRITE_ALLOWED_OPERATIONS;
  if (explicit) {
    for (const raw of explicit.split(',')) {
      const op = raw.trim();
      if (!op) continue;
      if (ALL_WRITE_OPS.has(op)) {
        ops.add(op);
      } else {
        console.error(`Warning: unknown write operation "${op}" — ignoring`);
      }
    }
  }

  return ops;
}

function parseArgs(): { username: string; apiKey: string } {
  const args = process.argv.slice(2);
  let username = process.env.WACM_USERNAME;
  let apiKey = process.env.WACM_API_KEY;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username' && args[i + 1]) {
      username = args[++i];
    } else if (args[i] === '--api-key' && args[i + 1]) {
      apiKey = args[++i];
    }
  }

  if (!username || !apiKey) {
    console.error(
      'Missing credentials. Set WACM_USERNAME and WACM_API_KEY environment variables, ' +
        'or pass --username and --api-key flags.',
    );
    process.exit(1);
  }

  return { username, apiKey };
}

async function main(): Promise<void> {
  const { username, apiKey } = parseArgs();
  const allowedWriteOps = resolveWriteOps();
  const server = createServer(username, apiKey, allowedWriteOps);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
