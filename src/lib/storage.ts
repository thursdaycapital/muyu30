import { kv } from "@vercel/kv";

const MAX_KNOCKS = Number(process.env.MAX_KNOCKS ?? 28);
const TTL_SECONDS = Number(process.env.KNOCK_TTL_SECONDS ?? 60 * 60 * 72);

type LeaderboardEntry = {
  fid: number;
  count: number;
};

type RecordResult = {
  count: number;
  remaining: number;
  limited: boolean;
};

const hasKv =
  Boolean(process.env.KV_REST_API_URL) &&
  Boolean(process.env.KV_REST_API_TOKEN);

const memoryCounts = new Map<string, Map<number, number>>();

function getCountMap(dayKey: string) {
  let counts = memoryCounts.get(dayKey);
  if (!counts) {
    counts = new Map();
    memoryCounts.set(dayKey, counts);
  }
  return counts;
}

function memoryLeaderboard(dayKey: string): LeaderboardEntry[] {
  const map = memoryCounts.get(dayKey);
  if (!map) return [];
  return Array.from(map.entries())
    .map(([fid, count]) => ({ fid, count }))
    .sort((a, b) => b.count - a.count);
}

function kvDailyKey(dayKey: string) {
  return `muyu:${dayKey}`;
}

function kvLeaderboardKey(dayKey: string) {
  return `muyu:lb:${dayKey}`;
}

export async function getCount(fid: number, dayKey: string): Promise<number> {
  if (hasKv) {
    const count = await kv.hget<number>(kvDailyKey(dayKey), String(fid));
    return count ?? 0;
  }

  const counts = getCountMap(dayKey);
  return counts.get(fid) ?? 0;
}

export async function recordKnock(
  fid: number,
  dayKey: string
): Promise<RecordResult> {
  if (hasKv) {
    const counterKey = kvDailyKey(dayKey);
    const leaderboardKey = kvLeaderboardKey(dayKey);
    const current = (await kv.hget<number>(counterKey, String(fid))) ?? 0;

    if (current >= MAX_KNOCKS) {
      return { count: current, remaining: 0, limited: true };
    }

    const nextCount = current + 1;
    const pipeline = kv.pipeline();
    pipeline.hset(counterKey, { [fid]: nextCount });
    pipeline.zadd(leaderboardKey, { score: nextCount, member: String(fid) });
    pipeline.expire(counterKey, TTL_SECONDS);
    pipeline.expire(leaderboardKey, TTL_SECONDS);
    await pipeline.exec();

    return {
      count: nextCount,
      remaining: Math.max(0, MAX_KNOCKS - nextCount),
      limited: false,
    };
  }

  const counts = getCountMap(dayKey);
  const current = counts.get(fid) ?? 0;
  if (current >= MAX_KNOCKS) {
    return { count: current, remaining: 0, limited: true };
  }

  const next = current + 1;
  counts.set(fid, next);

  return {
    count: next,
    remaining: Math.max(0, MAX_KNOCKS - next),
    limited: false,
  };
}

export async function leaderboard(
  dayKey: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  if (hasKv) {
    const rows = await kv.zrange<{ member: string; score: number }>(
      kvLeaderboardKey(dayKey),
      0,
      limit - 1,
      { rev: true, withScores: true }
    );

    return rows.map((row) => ({
      fid: Number(row.member),
      count: Number(row.score),
    }));
  }

  return memoryLeaderboard(dayKey).slice(0, limit);
}

export { MAX_KNOCKS };
