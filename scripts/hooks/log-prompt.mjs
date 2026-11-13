// Appends every prompt to .ai-logs/prompts.log (git-ignored). Shows auditability.
import { appendFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { readPayload, repoRoot } from './_input.mjs';

const tool = process.argv[2] ?? 'unknown';
const payload = await readPayload();
const prompt = payload.prompt ?? '(no prompt in payload)';

const dir = resolve(repoRoot, '.ai-logs');
mkdirSync(dir, { recursive: true });
appendFileSync(resolve(dir, 'prompts.log'), `${new Date().toISOString()} [${tool}] ${prompt}\n`);
process.exit(0);
