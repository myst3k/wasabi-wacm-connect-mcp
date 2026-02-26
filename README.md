# WACM Connect MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides read-only access to the [Wasabi WACM Connect API](https://docs.wasabi.com/docs/wacm-connect-api). Designed for Managed Service Providers (MSPs) who need to query their Wasabi account hierarchy, storage usage, and billing data through Claude.

## Prerequisites

- **Node.js 24+** (uses native `fetch`)
- **WACM Connect API credentials** — generate an API key in WACM under **My Profile > WACM Connect** ([Wasabi docs](https://docs.wasabi.com/docs/generating-wacm-connect-api-keys))

## Installation

```bash
git clone https://github.com/myst3k/wasabi-wacm-connect-mcp.git
cd wasabi-wacm-connect-mcp
pnpm install
pnpm build
```

## Configuration

### Claude Code (`.mcp.json`)

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "wasabi-wacm-connect-mcp": {
      "command": "node",
      "args": ["/path/to/wasabi-wacm-connect-mcp/dist/index.js"],
      "env": {
        "WACM_USERNAME": "your-username",
        "WACM_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "wasabi-wacm-connect-mcp": {
      "command": "node",
      "args": ["/path/to/wasabi-wacm-connect-mcp/dist/index.js"],
      "env": {
        "WACM_USERNAME": "your-username",
        "WACM_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WACM_USERNAME` | WACM Connect username | Yes |
| `WACM_API_KEY` | WACM Connect API key | Yes |

CLI flags `--username` and `--api-key` override environment variables.

## Available Tools (18)

### Control Accounts

| Tool | Description |
|------|-------------|
| `list_control_accounts` | List all Control Accounts with storage allocation and sub-account counts |
| `get_control_account` | Get a specific Control Account by ID |
| `list_control_account_usages` | List aggregate usage data (storage, egress, ingress, API calls) |
| `get_control_account_usage` | Get a specific usage record by utilization ID |
| `list_control_account_buckets` | List bucket-level utilization for a Control Account |

### Sub-Accounts

| Tool | Description |
|------|-------------|
| `list_sub_accounts` | List all Sub-Accounts (Wasabi Console accounts) |
| `get_sub_account` | Get a specific Sub-Account by ID |
| `list_sub_account_buckets` | List bucket-level utilization for a Sub-Account |

### Channel Accounts

| Tool | Description |
|------|-------------|
| `list_channel_accounts` | List all Channel Accounts (third-party access tier) |
| `get_channel_account` | Get a specific Channel Account by ID |

### Members

| Tool | Description |
|------|-------------|
| `list_members` | List Sub-Account members with roles and MFA status |
| `get_member` | Get a specific member by ID |

### Invoices

| Tool | Description |
|------|-------------|
| `list_invoices` | List invoices with cost breakdowns by sub-account |
| `get_invoice` | Get a specific invoice by ID |

### Usages

| Tool | Description |
|------|-------------|
| `list_usages` | List Sub-Account level daily usage metrics |
| `get_usage` | Get a specific usage record by utilization ID |

### Standalone Accounts

| Tool | Description |
|------|-------------|
| `list_standalone_accounts` | List Standalone Accounts (not in WACM hierarchy) |
| `get_storage_amounts` | Get available storage amount options |

## Available Resources (4)

| Resource | URI | Description |
|----------|-----|-------------|
| Account Hierarchy | `wacm://hierarchy` | Markdown documentation of the 4-tier account structure |
| Control Account | `wacm://control-accounts/{id}` | Dynamic resource for Control Account details |
| Sub-Account | `wacm://sub-accounts/{id}` | Dynamic resource for Sub-Account details |
| Countries | `wacm://reference/countries` | Available country codes for account creation |

## Available Prompts (5)

| Prompt | Description | Parameters |
|--------|-------------|------------|
| `storage-summary` | Summarize storage usage, highlight accounts near quota | `controlAccountId` (optional) |
| `billing-report` | Monthly billing breakdown by sub-account | `from`, `to`, `controlAccountId` (optional) |
| `account-audit` | Audit hierarchy for deactivated/insecure accounts | `controlAccountId` (optional) |
| `usage-trend` | Analyze usage trends over time for a sub-account | `subAccountId`, `from`, `to` |
| `bucket-analysis` | Analyze bucket utilization, find largest/most active | `accountId`, `accountType` |

## Example Conversations

### Check Storage Across All Accounts

> "Show me a summary of storage usage across all my control accounts"

Claude will use the `storage-summary` prompt to call `list_control_accounts` and `list_sub_accounts`, then present a table comparing active storage against quotas.

### Investigate Monthly Costs

> "What were my top costs last month? Break it down by sub-account."

Claude will call `list_invoices` with the previous month's date range, group by sub-account, and identify the highest-cost accounts and categories.

### Security Audit

> "Audit my account hierarchy for any security concerns"

Claude will use the `account-audit` prompt to enumerate all accounts and members, checking for missing MFA, deactivated accounts, and misconfigured quotas.

## Troubleshooting

### Authentication Errors

- Verify your credentials: `curl -u "$WACM_USERNAME:$WACM_API_KEY" https://api.wacm.wasabisys.com/api/v1/control-accounts`
- API keys are shown only once at generation time — regenerate if lost
- Check that you're using the correct key type (Account API Key vs Personal API Key)

### Rate Limiting

- The API allows 5 GET requests per second per API key
- The client automatically retries once on HTTP 429 responses
- For bulk operations, expect automatic throttling by the built-in rate limiter

### Missing Data

- Check your user permissions — visibility depends on your tier in the account hierarchy
- Governance users see all accounts; Control Account users see only their own
- Use `includeDeleted: true` to see deleted sub-accounts

## Security

- **Credentials are stored in memory only** — never written to disk or logs
- **Sensitive fields hidden by default** — `includeKeys` and `includeApiKey` default to `false`
- **CLI arg visibility** — `--api-key` via CLI is visible in `ps` output; prefer environment variables for production
- **Cloud LLM considerations** — data retrieved through this server may be processed by cloud AI services; review your organization's data handling policies
- **Key rotation** — regenerate API keys periodically in WACM under My Profile > WACM Connect

## Development

```bash
pnpm install
pnpm dev             # Run with tsx (auto-reload)
pnpm build           # Compile TypeScript
pnpm test            # Run tests
pnpm lint            # Lint code
pnpm format          # Format code
pnpm check           # Type-check without emitting
```

## License

Apache-2.0
