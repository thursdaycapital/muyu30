import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth";
import { currentDayKey } from "@/lib/date";
import { MAX_KNOCKS, leaderboard, recordKnock } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const verified = await verifyRequest(req);
  if ("error" in verified) {
    return verified.error;
  }

  const day = currentDayKey();
  const result = await recordKnock(verified.fid, day);
  const top = await leaderboard(day, 12);

  if (result.limited) {
    return NextResponse.json(
      {
        error: "limit_reached",
        message: "已经完成今天的28敲啦，明天再来！",
        count: result.count,
        remaining: result.remaining,
        leaderboard: top,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    fid: verified.fid,
    day,
    count: result.count,
    remaining: result.remaining,
    leaderboard: top,
    limit: MAX_KNOCKS,
  });
}
