export const DAY_START = 8;
export const DAY_END = 19;

export function hoursSinceDayStart(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60 - DAY_START;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
