---
description: Wire the CaBrain MCP into another client (Claude Desktop, Codex, Gemini, Cursor).
argument-hint: "[claude-desktop|claude-code|codex|gemini|cursor|print] [--brain NAME]"
---

Help the user connect another AI client to CaBrain via the `cabrain` CLI.

- If `$ARGUMENTS` names a client, run `cabrain mcp:install $ARGUMENTS` via Bash (it merges the MCP config idempotently, preserving other servers).
- If no client is given, run `cabrain mcp:print claude-desktop` to show the config snippet and list the supported clients: `claude-desktop`, `claude-code`, `codex`, `gemini`, `cursor`, `print`.
- Remind them to run `cabrain auth login --token <cbt_…>` first if they haven't saved a token, and to restart the target client afterward.

For a brain-scoped setup, pass `--brain <name>` through to the CLI.
