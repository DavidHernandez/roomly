// Formats the file the agent just edited with Prettier. Never blocks the agent.
// Uses Prettier's Node API instead of `npx prettier`, so it also works on Windows.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { filePathFrom, readPayload, repoRoot, toolArgs } from './_input.mjs';

const payload = await readPayload();
const file = filePathFrom(toolArgs(payload));

if (file) {
  const abs = resolve(repoRoot, file);
  try {
    const prettier = await import('prettier');
    const info = await prettier.getFileInfo(abs, {
      ignorePath: resolve(repoRoot, '.prettierignore'),
    });
    if (existsSync(abs) && !info.ignored && info.inferredParser) {
      const source = readFileSync(abs, 'utf8');
      const options = (await prettier.resolveConfig(abs)) ?? {};
      const formatted = await prettier.format(source, { ...options, filepath: abs });
      if (formatted !== source) writeFileSync(abs, formatted);
    }
  } catch {
    // Formatting is best effort: a failing formatter must not break the session.
  }
}
process.exit(0);
