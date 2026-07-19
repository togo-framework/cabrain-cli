# cabrain-cli

**Connect any AI client to the [CaBrain](https://cabrain.fadymondy.com) memory system in one command.**

`cabrain` is a single, dependency-free Go binary that is *both* the MCP server and its
installer. It speaks the [Model Context Protocol](https://modelcontextprotocol.io) over
stdio (a thin adapter over the CaBrain REST API), and it wires that server into every
MCP host — Claude Desktop, Claude Code, Codex, Gemini CLI, Cursor — so a new user goes
from zero to a working brain in two commands.

```
┌────────────┐   spawns    ┌──────────────┐   HTTPS + X-Cabrain-Token   ┌──────────────┐
│ MCP client │ ──────────▶ │ cabrain mcp  │ ──────────────────────────▶ │ CaBrain API  │
│ (Claude…)  │  (stdio)    │ (this binary)│                             │ brains + ACL │
└────────────┘             └──────────────┘                             └──────────────┘
```

## Install

```sh
curl -fsSL https://cabrain.fadymondy.com/install.sh | sh
```

or, with Go:

```sh
go install github.com/togo-framework/cabrain-cli@latest   # installs `cabrain`
```

One-liner that installs, logs in, and wires a client in a single shot:

```sh
CABRAIN_TOKEN=cbt_… CABRAIN_CLIENT=claude-desktop \
  sh -c "$(curl -fsSL https://cabrain.fadymondy.com/install.sh)"
```

## Quick start

```sh
cabrain auth login --token cbt_…          # save endpoint + token to ~/.cabrain/config.json
cabrain mcp:install claude-desktop        # wire the brain into your client — done
# restart the client; the brain tools (memory_recall, memory_retain, …) appear automatically
```

Get a token from an admin: `cabrain auth token new my-laptop` (admin), or ask the brain owner.

## Commands

| command | what it does |
|---|---|
| `cabrain auth login [--url U] [--token T] [--agent ID] [--brain NS]` | save credentials (verifies reachability) |
| `cabrain auth logout` | forget the saved token |
| `cabrain auth whoami` | show endpoint + which brains your token can reach |
| `cabrain auth token new <agentId> [--admin] [--brain NS]` | mint a token, optionally grant it a brain |
| `cabrain auth token list` | list tokens + grants (admin) |
| `cabrain mcp` | run the stdio MCP server (this is what clients invoke) |
| `cabrain mcp:install <client> [--brain NS] [--name N] [--user]` | wire the MCP into a client |
| `cabrain mcp:print <client> [--brain NS]` | print the config snippet, write nothing |
| `cabrain mcp:uninstall <client> [--name N]` | remove the cabrain entry from a client |
| `cabrain brain list` | list brains you can read |
| `cabrain brain create <name> [--description D] [--token]` | create a new empty named brain (+ optional scoped token) |
| `cabrain brain delete <name> --confirm` | delete a brain and all its memories |
| `cabrain recall <brain> <query…>` | hybrid recall (vector + BM25 + rerank) |
| `cabrain retain <brain> <content…>` | store a memory |

Colon (`mcp:install`) and space (`mcp install`) forms are equivalent.

## Supported clients

| client | config file it writes | format |
|---|---|---|
| `claude-code` | `./.mcp.json` (project) or `~/.claude.json` with `--user` | JSON |
| `claude-desktop` | `~/Library/Application Support/Claude/claude_desktop_config.json` (mac), `%APPDATA%\Claude\…` (win), `~/.config/Claude/…` (linux) | JSON |
| `codex` | `~/.codex/config.toml` `[mcp_servers.cabrain]` | TOML |
| `gemini` | `~/.gemini/settings.json` | JSON |
| `cursor` | `~/.cursor/mcp.json` | JSON |
| `print` | stdout only | JSON |

Installs **merge** into existing config (other MCP servers are preserved) and are
**idempotent** — re-running replaces just the `cabrain` entry.

## Creating and sharing a brain

```sh
cabrain brain create research --description "market + competitor notes" --token
```

This seeds the namespace, mints a **non-admin token scoped to just that brain**, grants
it read+write, and prints a ready-to-paste MCP snippet you can hand to a teammate — they
paste it into their client (or run `cabrain mcp:install <client> --brain research`) and
they're in, with access to *only* that brain.

> Brains are enumerated from stored memories, so `brain create` writes one genesis marker
> to make the namespace exist and be connectable.

## Configuration

Resolution order (highest wins): **flags → environment → `~/.cabrain/config.json`**.

| env var | meaning |
|---|---|
| `CABRAIN_API_URL` | base URL of the CaBrain app (default `https://cabrain.fadymondy.com`) |
| `CABRAIN_TOKEN` | ACL token, sent as `X-Cabrain-Token` (per-brain read/write; admin bypasses grants) |
| `CABRAIN_AGENT_ID` | this session's agent identity, sent as `X-Agent-Id` |
| `CABRAIN_DEFAULT_NAMESPACE` | bind the MCP session to one brain (tools default `namespace` to it) |

The installer bakes these into each client's `env` block, so the client launches
`cabrain mcp` fully configured.

## MCP tools exposed

`memory_recall`, `memory_retain`, `memory_get`, `memory_forget`, `memory_edit`,
`memory_gaps`, `memory_resolve_gap`, `brain_list`, `brain_details`, `brain_create`,
`brain_delete`, `brain_grant`, `brain_revoke_grant`, `brain_create_token`,
`brain_tokens`, `brain_chat`, `secret_list/store/reveal/delete`,
`datasource_list/create/sync/delete` — 24 tools mirroring the CaBrain REST contract.

## Build

```sh
go build -ldflags "-X main.version=$(git describe --tags)" -o cabrain .
```

Zero external dependencies (stdlib only) → one static binary per platform.
