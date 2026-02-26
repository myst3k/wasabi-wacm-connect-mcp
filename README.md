# WACM Connect MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for the [Wasabi WACM Connect API](https://docs.wasabi.com/docs/wacm-connect-api). Provides 18 read-only tools out of the box, with 12 opt-in write tools behind tiered access controls. Designed for Managed Service Providers (MSPs) who need to manage their Wasabi account hierarchy, storage usage, and billing data through Claude.

> [!WARNING]
> **This MCP server has write access to your Wasabi account management infrastructure.**
>
> This tool can create, modify, and delete sub-accounts, members, channel accounts, and other resources in your live WACM environment. **Actions taken through this MCP are real and may be irreversible.**

## Disclaimer

This is an independent, community-maintained project. It is **not affiliated with, endorsed by, or supported by Wasabi Technologies**. "Wasabi" and "WACM" are trademarks of Wasabi Technologies, Inc. Wasabi Technologies is not responsible for unintended changes made through this integration.

### AI-Specific Risks

This server is designed to be operated by an AI assistant (LLM). AI models can and do make mistakes — they may misinterpret instructions, hallucinate parameter values, or take actions you did not intend. In the context of account management, this means an AI could accidentally:

- **Create unwanted accounts** with incorrect configurations or storage quotas
- **Modify existing accounts** by changing settings, roles, or permissions you didn't ask to change
- **Delete accounts, members, or channel accounts** that were not meant to be removed
- **Perform bulk operations** across multiple resources when you intended a single change
- **Act on the wrong resource** by confusing similarly named accounts or IDs

These are real API calls against your real Wasabi infrastructure unless you are using a dedicated test account. There is no sandbox, staging layer, or undo button between the AI and your environment.

### Before Use

- **Understand your API credentials** — the API key's permission scope determines what the AI can reach
- **Test in a non-production environment** if possible before enabling write access on production accounts
- **Start read-only** — write tools are disabled by default; only enable the minimum tier you need
- **Use dry-run mode** — every write tool supports `dryRun: true` to preview the exact HTTP request before execution
- **Review all AI-suggested actions** before confirming, especially bulk operations or deletions
- **Prefer the operation allowlist** over broad tier access to limit exposure to only the tools you actually need

### Liability

**Use at your own risk.** The authors assume no liability for data loss, service disruption, unintended account modifications, or other damages resulting from use of this software — whether caused by AI error, misconfiguration, or any other reason. See the [Apache 2.0 license](LICENSE) for full terms.

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

Read-only (default):

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

With write access (create + update):

```json
{
  "mcpServers": {
    "wasabi-wacm-connect-mcp": {
      "command": "node",
      "args": ["/path/to/wasabi-wacm-connect-mcp/dist/index.js"],
      "env": {
        "WACM_USERNAME": "your-username",
        "WACM_API_KEY": "your-api-key",
        "WACM_WRITE_ACCESS": "true",
        "WACM_WRITE_LEVEL": "manage"
      }
    }
  }
}
```

With specific write operations only:

```json
{
  "mcpServers": {
    "wasabi-wacm-connect-mcp": {
      "command": "node",
      "args": ["/path/to/wasabi-wacm-connect-mcp/dist/index.js"],
      "env": {
        "WACM_USERNAME": "your-username",
        "WACM_API_KEY": "your-api-key",
        "WACM_WRITE_ACCESS": "true",
        "WACM_WRITE_ALLOWED_OPERATIONS": "create_sub_account,delete_member"
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
        "WACM_API_KEY": "your-api-key",
        "WACM_WRITE_ACCESS": "true",
        "WACM_WRITE_LEVEL": "full"
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
| `WACM_WRITE_ACCESS` | Set to `true` to enable write operations (kill switch) | No |
| `WACM_WRITE_LEVEL` | Write access tier: `create`, `manage`, or `full` (see below) | No |
| `WACM_WRITE_ALLOWED_OPERATIONS` | Comma-separated list of write operation names to enable | No |

CLI flags `--username` and `--api-key` override environment variables.

## Write Access Tiers

Write operations are disabled by default. To enable them, you must set `WACM_WRITE_ACCESS=true` **and** at least one of `WACM_WRITE_LEVEL` or `WACM_WRITE_ALLOWED_OPERATIONS`. The kill switch (`WACM_WRITE_ACCESS`) must be explicitly set — without it, no write tools are registered regardless of other settings.

| Tier | Tools Enabled | Count |
|------|---------------|-------|
| `create` | All 5 POST (create) tools | 5 |
| `manage` | `create` + 3 PUT (update) tools | 8 |
| `full` | `manage` + 4 DELETE tools | 12 |

When both env vars are set, the resolved operations are the **union** of both:
- `WACM_WRITE_LEVEL=manage` + `WACM_WRITE_ALLOWED_OPERATIONS=delete_member` → 9 write tools
- `WACM_WRITE_ALLOWED_OPERATIONS=create_sub_account,delete_member` (no level) → just those 2

Unknown level values or operation names are logged as warnings and ignored.

### Valid Operation Names

`create_sub_account`, `update_sub_account`, `delete_sub_account`, `create_member`, `update_member`, `delete_member`, `create_channel_account`, `update_channel_account`, `delete_channel_account`, `create_channel_account_user`, `delete_channel_account_user`, `create_standalone_account`

## Available Tools (up to 30)

### Control Accounts (read-only)

| Tool | Description |
|------|-------------|
| `list_control_accounts` | List all Control Accounts with storage allocation and sub-account counts |
| `get_control_account` | Get a specific Control Account by ID |
| `list_control_account_usages` | List aggregate usage data (storage, egress, ingress, API calls) |
| `get_control_account_usage` | Get a specific usage record by utilization ID |
| `list_control_account_buckets` | List bucket-level utilization for a Control Account |

### Sub-Accounts

| Tool | Description | Access |
|------|-------------|--------|
| `list_sub_accounts` | List all Sub-Accounts (Wasabi Console accounts) | Read |
| `get_sub_account` | Get a specific Sub-Account by ID | Read |
| `list_sub_account_buckets` | List bucket-level utilization for a Sub-Account | Read |
| `create_sub_account` | Create a new Sub-Account under a Control Account | Write (`create`) |
| `update_sub_account` | Update an existing Sub-Account | Write (`manage`) |
| `delete_sub_account` | Delete a Sub-Account | Write (`full`) |

### Channel Accounts

| Tool | Description | Access |
|------|-------------|--------|
| `list_channel_accounts` | List all Channel Accounts (third-party access tier) | Read |
| `get_channel_account` | Get a specific Channel Account by ID | Read |
| `create_channel_account` | Create a new Channel Account | Write (`create`) |
| `update_channel_account` | Update an existing Channel Account | Write (`manage`) |
| `delete_channel_account` | Delete a Channel Account | Write (`full`) |

### Channel Account Users

| Tool | Description | Access |
|------|-------------|--------|
| `create_channel_account_user` | Create a user for a Channel Account | Write (`create`) |
| `delete_channel_account_user` | Delete a Channel Account user | Write (`full`) |

### Members

| Tool | Description | Access |
|------|-------------|--------|
| `list_members` | List Sub-Account members with roles and MFA status | Read |
| `get_member` | Get a specific member by ID | Read |
| `create_member` | Create a new member in a Sub-Account | Write (`create`) |
| `update_member` | Update an existing member | Write (`manage`) |
| `delete_member` | Delete a member | Write (`full`) |

### Invoices (read-only)

| Tool | Description |
|------|-------------|
| `list_invoices` | List invoices with cost breakdowns by sub-account |
| `get_invoice` | Get a specific invoice by ID |

### Usages (read-only)

| Tool | Description |
|------|-------------|
| `list_usages` | List Sub-Account level daily usage metrics |
| `get_usage` | Get a specific usage record by utilization ID |

### Standalone Accounts

| Tool | Description | Access |
|------|-------------|--------|
| `list_standalone_accounts` | List Standalone Accounts (not in WACM hierarchy) | Read |
| `get_storage_amounts` | Get available storage amount options | Read |
| `create_standalone_account` | Create a new Standalone Account | Write (`create`) |

## Guardrails

Write operations are protected by multiple safety layers:

1. **Kill switch** — `WACM_WRITE_ACCESS=true` must be explicitly set to enable any write operations. Without this, all other write settings are ignored and the server is strictly read-only.

2. **Tiered access control** — `WACM_WRITE_LEVEL` controls which categories of write tools are registered. Unregistered tools are completely invisible to the LLM.

3. **Operation allowlist** — `WACM_WRITE_ALLOWED_OPERATIONS` provides fine-grained control over exactly which write tools are available, independent of or combined with tier levels.

4. **MCP tool annotations** — Each write tool carries metadata hints for the LLM:
   - Create (POST): `readOnlyHint: false`
   - Update (PUT): `readOnlyHint: false, idempotentHint: true`
   - Delete (DELETE): `readOnlyHint: false, destructiveHint: true`

5. **Dry-run mode** — Every write tool accepts a `dryRun` boolean parameter (default: `false`). When `true`, the tool returns a preview of the HTTP request (method, URL, headers, body) without executing it. Auth credentials are redacted in the preview.

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

### Create a Sub-Account with Dry Run

> "Create a new sub-account called 'Acme Corp' under control account 5 — but show me the request first"

Claude will call `create_sub_account` with `dryRun: true` and show the full HTTP request preview. After you confirm, it will execute the actual request.

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

### Write Tools Not Appearing

- Verify `WACM_WRITE_LEVEL` or `WACM_WRITE_ALLOWED_OPERATIONS` is set in your MCP config
- Check stderr for warning messages about unknown level values or operation names
- Restart the MCP server after changing environment variables

## Security

- **Credentials are stored in memory only** — never written to disk or logs
- **Sensitive fields hidden by default** — `includeKeys` and `includeApiKey` default to `false`
- **Write tools are opt-in** — no write operations are available unless explicitly enabled via env vars
- **Dry-run previews redact credentials** — `buildRequestPreview` replaces the auth header with `Basic [REDACTED]`
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
