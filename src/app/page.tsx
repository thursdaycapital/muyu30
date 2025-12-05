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
  const [isKnocking, setIsKnocking] = useState(false);
  const readySent = useRef(false);
  const muyuRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);

  const ready = async () => {
    if (readySent.current) return;
    readySent.current = true;
    try {
      await sdk.actions.ready();
    } catch (err) {
      console.warn("ready() failed", err);
    }
  };

  // 使用 Web Audio API 生成木鱼敲击音效
  const playSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      
      // 如果 AudioContext 处于 suspended 状态，需要用户交互来恢复
      let audioContext: AudioContext;
      try {
        audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(err => {
            console.warn("无法恢复音频上下文:", err);
          });
        }
      } catch (err) {
        console.warn("无法创建音频上下文:", err);
        return;
      }
      
      const now = audioContext.currentTime;
      
      // 主音调 - 木鱼的基础频率（中低音）
      const createTone = (freq: number, startTime: number, duration: number, volume: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, startTime);
        oscillator.type = 'sine';
        
        // 快速起音，缓慢衰减，模拟木鱼的回响
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.005); // 快速起音
        gainNode.gain.exponentialRampToValueAtTime(volume * 0.1, startTime + duration * 0.3); // 快速衰减
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // 缓慢消失
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        return { oscillator, gainNode };
      };
      
      // 创建多个谐波，模拟木鱼的丰富音色
      const tones = [
        createTone(180, now, 0.6, 0.25), // 基础音
        createTone(360, now, 0.5, 0.15), // 二次谐波
        createTone(540, now, 0.4, 0.08), // 三次谐波
        createTone(270, now + 0.05, 0.4, 0.1), // 轻微延迟的泛音，增加回响感
      ];
      
      // 清理资源
      const cleanup = () => {
        tones.forEach(({ oscillator, gainNode }) => {
          try {
            oscillator.disconnect();
            gainNode.disconnect();
          } catch (e) {
            // 忽略已断开连接的错误
          }
        });
      };
      
      // 在最后一个音调结束后清理
      setTimeout(cleanup, 700);
    } catch (err) {
      console.warn("音效播放失败:", err);
    }
  };

  // 触发敲击动画
  const triggerKnockAnimation = () => {
    setIsKnocking(true);
    
    // 木鱼缩放动画
    if (muyuRef.current) {
      muyuRef.current.style.transform = "scale(0.95)";
      setTimeout(() => {
        if (muyuRef.current) {
          muyuRef.current.style.transform = "scale(1)";
        }
      }, 150);
    }

    // 敲击棒动画
    if (stickRef.current) {
      stickRef.current.style.transform = "translateY(20px) rotate(-5deg)";
      setTimeout(() => {
        if (stickRef.current) {
          stickRef.current.style.transform = "translateY(0) rotate(0deg)";
        }
      }, 200);
    }

    // 重置动画状态
    setTimeout(() => {
      setIsKnocking(false);
    }, 300);
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
    // 防止重复点击
    if (busy) {
      console.log("正在处理中，请稍候...");
      return;
    }

    // 检查状态
    if (!state) {
      console.log("状态未加载完成，请稍候...");
      setError("正在加载，请稍候...");
      return;
    }

    const canKnockNow = (state.remaining ?? 0) > 0;
    if (!canKnockNow) {
      console.log("今日次数已用完");
      setError("今天已经敲完啦，明天再来！");
      return;
    }
    
    console.log("开始敲击木鱼...");
    
    // 立即播放音效和动画（即使后端调用失败也要有反馈）
    playSound();
    triggerKnockAnimation();
    
    setBusy(true);
    setError(null);

    try {
      const res = await safeFetch("/api/knock", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        console.log("敲击失败:", data.message);
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

      console.log("敲击成功:", data);
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
      console.error("敲击请求失败:", err);
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

        {/* 木鱼敲击区域 */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* 敲击棒 */}
            <div
              ref={stickRef}
              className="absolute -top-8 -right-8 z-10 transition-transform duration-200 ease-out"
              style={{ transformOrigin: "bottom center" }}
            >
              <img
                src="/muyu/stick.svg"
                alt="敲击棒"
                className="h-24 w-14"
                draggable={false}
              />
            </div>

            {/* 木鱼图标 */}
            <div
              ref={muyuRef}
              className="relative transition-transform duration-150 ease-out cursor-pointer select-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("木鱼被点击，当前状态:", { state, busy, canKnock });
                knock();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                console.log("木鱼被触摸，当前状态:", { state, busy, canKnock });
                knock();
              }}
              style={{ transformOrigin: "center center" }}
            >
              <img
                src="/muyu/muyu-icon.svg"
                alt="木鱼"
                className={`h-40 w-40 ${canKnock && !busy ? "hover:opacity-90 active:opacity-75" : "opacity-60"} transition-opacity pointer-events-none`}
                draggable={false}
              />
            </div>
          </div>

          {/* 敲击提示文字 */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("按钮被点击，当前状态:", { state, busy, canKnock });
              knock();
            }}
            disabled={!canKnock}
            className="mt-6 w-full rounded-2xl bg-gradient-to-b from-[#f2d19c] to-[#d88d3d] px-6 py-4 text-center text-lg font-semibold text-[#1f150a] shadow-lg shadow-[#d88d3d]/30 transition hover:translate-y-[-2px] hover:shadow-xl active:translate-y-[0px] disabled:cursor-not-allowed disabled:from-[#d5c7b0] disabled:to-[#c2a273]"
          >
            {loading
              ? "加载中..."
              : canKnock
                ? busy
                  ? "敲击中..."
                  : "点击木鱼敲一敲"
                : "明天再来"}
          </button>
        </div>
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
