export function currentDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatDayLabel(dayKey: string): string {
  return dayKey.replaceAll("-", "/");
}
