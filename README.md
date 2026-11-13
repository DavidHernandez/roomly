# Roomly 🏢

A tiny meeting room booking app, used as the shared playground for the
**AI extensibility training** (MCP servers, Skills and Hooks) with **Claude** and **GitHub Copilot**.

Roomly is fictional. The code is intentionally small and intentionally imperfect.

## Quick start

```bash
npm install
npm run dev        # API on http://localhost:3001, app on http://localhost:5173
npm test
```

Requires Node.js 20+.

## What's where

| Path                                           | What it is                                    |
| ---------------------------------------------- | --------------------------------------------- |
| `server/`                                      | Express + TypeScript API (in-memory data)     |
| `web/`                                         | Vue 3 + Vite + TypeScript app                 |
| `mcp-sprint-metrics/`                          | A minimal MCP server over `data/sprints.json` |
| `data/sprints.json`                            | Fake sprint history (velocity, bugs)          |
| `AGENTS.md`                                    | **Shared instructions** for every AI agent    |
| `CLAUDE.md`, `.github/copilot-instructions.md` | Thin pointers to `AGENTS.md`                  |
| `.mcp.json`                                    | MCP servers for Claude Code                   |
| `.vscode/mcp.json`                             | MCP servers for Copilot in VS Code            |
| `.claude/skills/`                              | Skills (Agent Skills format)                  |
| `.claude/settings.json`                        | Hooks for Claude Code                         |
| `.github/hooks/hooks.json`                     | Hooks for GitHub Copilot                      |
| `scripts/hooks/`                               | Hook scripts shared by both tools             |

## AI setup

### MCP servers

- **sprint-metrics** (local): try _"How has our velocity changed over the last 4 sprints?"_
- **github** (remote): Claude Code needs a `GITHUB_PAT` environment variable; VS Code signs you in with OAuth.
- **playwright** (local): lets the agent open and test the running app in a browser.

Test the sprint server on its own with `npm run inspect --workspace mcp-sprint-metrics`.

### Skills

`user-story-writer`, `release-notes`, `code-review`, `explain-for-pm`. Skills live in `.claude/skills/`.
Claude Code and Copilot in VS Code both read skills from this folder, so there is only one copy.
In VS Code, make sure the `chat.useAgentSkills` setting is on.

### Hooks

- Block edits to `.env` (fake values, committed on purpose for the demo)
- Format every file the agent edits with Prettier
- Log every prompt to `.ai-logs/prompts.log`

The scripts are plain Node, so they run on macOS, Linux and Windows. VS Code reads both
`.github/hooks/hooks.json` and `.claude/settings.json`, so in VS Code each prompt may be logged twice
(once tagged `claude`, once `copilot`). That's expected.

### Windows notes

- Claude Code on native Windows needs local MCP servers that use `npx` wrapped as
  `"command": "cmd", "args": ["/c", "npx", ...]` in `.mcp.json`. VS Code needs no change. WSL needs no change.
- Run `./scripts/seed-issues.sh` from Git Bash or WSL.

## Try it

- _"Rewrite issue 'Make booking better' as a proper user story."_
- _"Review `server/src/routes/rooms.ts`."_
- _"Explain `bookingService.ts` to a product owner."_
- _"Write release notes for everything closed this sprint."_
- _"Fix the bug about two teams in Aurora, with a test."_
