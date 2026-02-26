#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

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
  const server = createServer(username, apiKey);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
