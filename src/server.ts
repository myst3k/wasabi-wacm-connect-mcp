import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WacmClient } from './client/wacm-client.js';
import { registerControlAccountTools } from './tools/control-accounts.js';
import { registerSubAccountTools } from './tools/sub-accounts.js';
import { registerChannelAccountTools } from './tools/channel-accounts.js';
import { registerMemberTools } from './tools/members.js';
import { registerInvoiceTools } from './tools/invoices.js';
import { registerUsageTools } from './tools/usages.js';
import { registerAccountTools } from './tools/accounts.js';
import { registerSubAccountWriteTools } from './tools/sub-accounts-write.js';
import { registerMemberWriteTools } from './tools/members-write.js';
import { registerChannelAccountWriteTools } from './tools/channel-accounts-write.js';
import { registerChannelAccountUserWriteTools } from './tools/channel-account-users-write.js';
import { registerAccountWriteTools } from './tools/accounts-write.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';

export function createServer(
  username: string,
  apiKey: string,
  allowedWriteOps: Set<string> = new Set(),
): McpServer {
  const server = new McpServer({
    name: 'wasabi-wacm-connect-mcp',
    version: '1.0.0',
  });

  const client = new WacmClient(username, apiKey);

  registerControlAccountTools(server, client);
  registerSubAccountTools(server, client);
  registerChannelAccountTools(server, client);
  registerMemberTools(server, client);
  registerInvoiceTools(server, client);
  registerUsageTools(server, client);
  registerAccountTools(server, client);

  if (allowedWriteOps.size > 0) {
    registerSubAccountWriteTools(server, client, allowedWriteOps);
    registerMemberWriteTools(server, client, allowedWriteOps);
    registerChannelAccountWriteTools(server, client, allowedWriteOps);
    registerChannelAccountUserWriteTools(server, client, allowedWriteOps);
    registerAccountWriteTools(server, client, allowedWriteOps);
  }

  registerResources(server, client);
  registerPrompts(server);

  return server;
}
