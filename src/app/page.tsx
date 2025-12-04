"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { formatDayLabel } from "@/lib/date";
import { useEffect, useMemo, useRef, useState } from "react";

type LeaderboardEntry = { fid: number; count: number };

type State = {
  fid: number;
  day: string;
  count: number;
  remaining: number;
  leaderboard: LeaderboardEntry[];
};

const DAILY_LIMIT = Number(process.env.NEXT_PUBLIC_MAX_KNOCKS ?? 28);

async function safeFetch(input: RequestInfo, init?: RequestInit) {
  try {
    if (sdk?.quickAuth?.fetch) {
      return await sdk.quickAuth.fetch(input, init);
    }
  } catch (error) {
    console.warn("quickAuth fetch failed, falling back", error);
  }

  return fetch(input, init);
}

export default function Home() {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readySent = useRef(false);

  const ready = async () => {
    if (readySent.current) return;
    readySent.current = true;
    try {
      await sdk.actions.ready();
    } catch (err) {
      console.warn("ready() failed", err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await safeFetch("/api/state", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("需要在 Warpcast 中打开并登录");
        }
        const data = (await res.json()) as State;
        if (!cancelled) {
          setState(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("请在 Warpcast Mini App 内打开，完成一次登录。");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          await ready();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const knock = async () => {
    if (busy || !state) return;
    setBusy(true);
    setError(null);

    try {
      const res = await safeFetch("/api/knock", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "今天已经敲完啦");
        setState((prev) =>
          prev
            ? {
                ...prev,
                count: data.count ?? prev.count,
                remaining: data.remaining ?? prev.remaining,
                leaderboard: data.leaderboard ?? prev.leaderboard,
              }
            : prev
        );
        return;
      }

      setState((prev) =>
        prev
          ? {
              ...prev,
              count: data.count,
              remaining: data.remaining,
              leaderboard: data.leaderboard ?? prev.leaderboard,
            }
          : data
      );
    } catch (err) {
      console.error(err);
      setError("网络有点慢，稍后再试一次。");
    } finally {
      setBusy(false);
    }
  };

  const addMiniApp = async () => {
    try {
      await sdk.actions.addMiniApp?.();
    } catch (err) {
      console.warn("addMiniApp failed", err);
    }
  };

  const progress = useMemo(() => {
    const current = state?.count ?? 0;
    return Math.min(100, Math.round((current / DAILY_LIMIT) * 100));
  }, [state?.count]);

  const canKnock = (state?.remaining ?? 0) > 0 && !busy;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6 text-[#1f150a]">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7a5c3a]">
            木鱼28
          </p>
          <h1 className="text-2xl font-semibold">每天敲木鱼 28 次</h1>
          <p className="text-sm text-[#735733]">
            {state?.day ? `今天 · ${formatDayLabel(state.day)}` : "加载中..."}
          </p>
        </div>
        <button
          onClick={addMiniApp}
          className="rounded-full bg-[#7f4f1d] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#7f4f1d]/30 transition hover:scale-[1.02] active:scale-[0.99]"
        >
          收藏
        </button>
      </header>

      <section className="mt-6 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-[#7f4f1d]/10 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-[#735733]">今日进度</p>
            <div className="text-4xl font-semibold leading-tight">
              {loading ? "--" : state?.count ?? 0}
              <span className="ml-2 text-base font-normal text-[#735733]">
                / {DAILY_LIMIT}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-[#735733]">
            <p>剩余可敲</p>
            <p className="text-xl font-semibold text-[#1f150a]">
              {loading ? "--" : state?.remaining ?? DAILY_LIMIT}
            </p>
          </div>
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#f1e4cf]">
          <div
            className="h-full bg-gradient-to-r from-[#f3c36b] to-[#d87c37] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={knock}
          disabled={!canKnock}
          className="mt-6 w-full rounded-2xl bg-gradient-to-b from-[#f2d19c] to-[#d88d3d] px-6 py-6 text-center text-xl font-semibold text-[#1f150a] shadow-lg shadow-[#d88d3d]/30 transition hover:translate-y-[-2px] hover:shadow-xl active:translate-y-[0px] disabled:cursor-not-allowed disabled:from-[#d5c7b0] disabled:to-[#c2a273]"
        >
          {loading
            ? "加载中..."
            : canKnock
              ? busy
                ? "敲击中..."
                : "敲一敲"
              : "明天再来"}
        </button>
        {error && (
          <p className="mt-3 text-sm text-[#a03d2a]">
            {error}
          </p>
        )}
        <p className="mt-2 text-xs text-[#7a5c3a]">
          小提示：完成 28 次后自动结算，好友榜会实时更新。
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-md shadow-[#7f4f1d]/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">好友榜</h2>
          <span className="text-xs text-[#735733]">
            实时按今日次数排序
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {(state?.leaderboard ?? []).length === 0 && (
            <p className="text-sm text-[#735733]">
              等待第一声木鱼响起。
            </p>
          )}
          {(state?.leaderboard ?? []).map((item, idx) => (
            <div
              key={item.fid}
              className="flex items-center justify-between rounded-2xl border border-[#f0e4d6] bg-[#fdf9f3] px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2d19c] text-sm font-semibold text-[#1f150a]">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold">FID {item.fid}</p>
                  <p className="text-xs text-[#735733]">今日 {item.count} 次</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-[#1f150a]">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
