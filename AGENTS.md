# Roomly: instructions for AI coding agents

This file is the single source of truth for both Claude Code and GitHub Copilot.
`CLAUDE.md` and `.github/copilot-instructions.md` only point here.

## Product

Roomly is a small internal app for booking meeting rooms for the day.
Users are office employees, mostly non-technical. Copy in the UI must be plain, active and specific.

## Stack

- `server/`: Node.js, Express 4, TypeScript (strict). In-memory store in `server/src/data/store.ts`.
- `web/`: Vue 3 (`<script setup lang="ts">`), Vite. Talks to the API through `web/src/api.ts` only.
- `mcp-sprint-metrics/`: demo MCP server over `data/sprints.json`.

## Commands

- Install: `npm install` (root, uses workspaces)
- Run everything: `npm run dev` (API on 3001, web on 5173)
- Tests: `npm test`
- Type check: `npm run typecheck`

## Conventions

- TypeScript strict. Never use `any`; use `unknown` and narrow.
- camelCase for variables and functions, PascalCase for types and components.
- Arrow functions or named `function` declarations are both fine, but route handlers are inline arrow functions.
- Server errors: throw `HttpError` from `server/src/errors.ts`. Never call `res.status(...).send(...)` for errors in routes; the error middleware formats every error as `{ "error": string }`.
- No `console.log` in server code. Use `logger` from `server/src/logger.ts`.
- Use `===`, never `==`.
- Business rules live in `server/src/services/`, not in routes.
- Every bug fix comes with a test in a `*.test.ts` file next to the code (Vitest).
- Error messages say what went wrong and how to fix it. No apologies.

## Business rules

- A room can hold up to `capacity` people, inclusive.
- Two bookings in the same room conflict if their time ranges overlap. Back-to-back is allowed (one ends 10:00, next starts 10:00).
- Bookings are for today only (for now).

## Never

- Never edit `.env`. Ask a human.
- Never add dependencies without saying why in the PR description.
