import { NextRequest, NextResponse } from "next/server";
import { currentDayKey } from "@/lib/date";
import { verifyRequest } from "@/lib/auth";
import { MAX_KNOCKS, getCount, leaderboard } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const verified = await verifyRequest(req);
  if ("error" in verified) {
    return verified.error;
  }

  const day = currentDayKey();
  const count = await getCount(verified.fid, day);
  const top = await leaderboard(day, 12);

  return NextResponse.json({
    fid: verified.fid,
    day,
    count,
    remaining: Math.max(0, MAX_KNOCKS - count),
    leaderboard: top,
  });
}
