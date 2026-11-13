// Blocks any tool call that would touch a real .env file (.env.example is fine).
// Claude Code: exit code 2 blocks the call and sends stderr back to Claude.
// Copilot (--copilot): print a JSON permission decision on stdout and exit 0.
import { readPayload, toolArgs } from './_input.mjs';

const isCopilot = process.argv.includes('--copilot');
const payload = await readPayload();
const args = JSON.stringify(toolArgs(payload));

const touchesEnv = /(^|[\\/"'\s])\.env(?!\.example)(\b|$)/.test(args);

if (touchesEnv) {
  const reason = 'Editing .env is not allowed in this repo. Ask a human to change secrets.';
  if (isCopilot) {
    process.stdout.write(
      JSON.stringify({ permissionDecision: 'deny', permissionDecisionReason: reason }),
    );
    process.exit(0);
  }
  process.stderr.write(reason + '\n');
  process.exit(2);
}
process.exit(0);
