// Shared helpers: read the hook payload from stdin and normalise the
// differences between Claude Code and GitHub Copilot payloads.
//   Claude Code (and Copilot's PascalCase events): { tool_name, tool_input: {...}, prompt, ... }
//   Copilot camelCase events (preToolUse, ...):    { toolName, toolArgs, prompt, ... }
//     toolArgs may arrive as an object or as a JSON string, so both are handled.
// Reference: docs.github.com/en/copilot/reference/hooks-configuration
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repo root, whatever directory the tool runs the hook from. */
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export async function readPayload() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

export function toolArgs(payload) {
  if (payload.tool_input) return payload.tool_input;
  if (typeof payload.toolArgs === 'string') {
    try {
      return JSON.parse(payload.toolArgs);
    } catch {
      return { raw: payload.toolArgs };
    }
  }
  return payload.toolArgs ?? {};
}

export function filePathFrom(args) {
  return args.file_path ?? args.filePath ?? args.path ?? null;
}
