/**
 * Sprint Metrics MCP server (stdio).
 *
 * Teaching points:
 *  1. Tool names and descriptions are read by the model: write them for the model.
 *  2. Input schemas (zod) are validated before your handler runs.
 *  3. Return small, focused results, not raw dumps.
 *  4. stdio servers must NEVER write to stdout except protocol messages.
 *     Use console.error for logs.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

interface Sprint {
  number: number;
  start: string;
  committed: number;
  completed: number;
  bugsOpened: number;
  bugsClosed: number;
  teamSize: number;
  goal: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, '../../data/sprints.json');

function loadSprints(): Sprint[] {
  // Read on every call so edits to the JSON show up without restarting.
  return (JSON.parse(readFileSync(dataPath, 'utf8')) as { sprints: Sprint[] }).sprints;
}

const lastN = (n: number | undefined) => {
  const all = loadSprints();
  return n ? all.slice(-n) : all;
};

const text = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
});

const server = new McpServer({ name: 'sprint-metrics', version: '0.1.0' });

server.registerTool(
  'get_velocity',
  {
    title: 'Team velocity',
    description:
      'Story points committed vs completed per sprint for the Roomly team, plus the average ' +
      'completed points and completion rate. Use for questions about velocity, predictability ' +
      'or how much the team can take on next sprint.',
    inputSchema: {
      lastN: z.number().int().min(1).max(20).optional().describe('Only the most recent N sprints'),
    },
  },
  async ({ lastN: n }) => {
    const sprints = lastN(n);
    const avg = sprints.reduce((s, x) => s + x.completed, 0) / sprints.length;
    return text({
      sprints: sprints.map((s) => ({
        sprint: s.number,
        committed: s.committed,
        completed: s.completed,
        completionRate: Math.round((s.completed / s.committed) * 100) + '%',
      })),
      averageCompleted: Math.round(avg * 10) / 10,
    });
  },
);

server.registerTool(
  'get_bug_trend',
  {
    title: 'Bug trend',
    description:
      'Bugs opened vs closed per sprint and the running count of open bugs. Use for questions ' +
      'about quality, bug backlog growth or technical debt.',
    inputSchema: {
      lastN: z.number().int().min(1).max(20).optional().describe('Only the most recent N sprints'),
    },
  },
  async ({ lastN: n }) => {
    let open = 0;
    const all = loadSprints().map((s) => {
      open += s.bugsOpened - s.bugsClosed;
      return { sprint: s.number, opened: s.bugsOpened, closed: s.bugsClosed, openAtEnd: open };
    });
    return text(n ? all.slice(-n) : all);
  },
);

server.registerTool(
  'get_sprint_summary',
  {
    title: 'Sprint summary',
    description: 'Everything recorded about one sprint: goal, dates, points, bugs and team size.',
    inputSchema: { sprint: z.number().int().min(1).describe('Sprint number, e.g. 7') },
  },
  async ({ sprint }) => {
    const found = loadSprints().find((s) => s.number === sprint);
    if (!found) {
      return { isError: true, content: [{ type: 'text' as const, text: `No sprint ${sprint}.` }] };
    }
    return text(found);
  },
);

await server.connect(new StdioServerTransport());
console.error('sprint-metrics MCP server running on stdio');
