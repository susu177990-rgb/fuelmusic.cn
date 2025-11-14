"use client";

import React, { useMemo, useState } from "react";

type Tier = { key: "basic" | "pro" | "studio"; label: string; price: number };

const STEMS_BASE_TRACKS = 10;   // 起算轨数
const STEMS_BASE_PRICE  = 1000; // 10 轨起步价
const STEMS_EXTRA_PER   = 80;   // 每超 1 轨 +¥

const ARR_TIERS: Tier[] = [
  { key: "basic",  label: "基础编曲（电子/嘻哈/流行）",   price: 2000 },
  { key: "pro",    label: "进阶编曲（完整结构/音色设计）", price: 3000 },
  { key: "studio", label: "旗舰编曲（含现场乐器/重采样）", price: 5000 },
];

function cn(n: number) {
  return `￥${n.toLocaleString("zh-CN")}`;
}

const PricingEstimator: React.FC = () => {
  const [mode, setMode] = useState<"stems" | "arr">("stems");
  const [tracks, setTracks] = useState<number>(STEMS_BASE_TRACKS);
  const [tier, setTier] = useState<Tier["key"]>("basic");

  const price = useMemo(() => {
    if (mode === "stems") {
      const extra = Math.max(0, tracks - STEMS_BASE_TRACKS);
      return STEMS_BASE_PRICE + extra * STEMS_EXTRA_PER;
    }
    const t = ARR_TIERS.find((x) => x.key === tier);
    return t ? t.price : 2000;
  }, [mode, tracks, tier]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur px-4 py-5 md:px-6 md:py-6 shadow-[0_12px_40px_rgba(109,82,255,0.18)]">
      {/* 顶部切换 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("stems")}
          className={`px-3 py-1.5 rounded-full text-sm transition ${mode==="stems" ? "bg-white/15 text-white" : "bg-white/5 text-white/70 hover:text-white"}`}
        >
          分轨混音
        </button>
        <button
          type="button"
          onClick={() => setMode("arr")}
          className={`px-3 py-1.5 rounded-full text-sm transition ${mode==="arr" ? "bg-white/15 text-white" : "bg-white/5 text-white/70 hover:text-white"}`}
        >
          编曲定制
        </button>
        <span className="ml-auto text-xs text-white/50">
          * 结果仅供参考，最终以沟通与工程评估为准
        </span>
      </div>

      {/* 参数区 */}
      {mode === "stems" ? (
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="block text-sm text-white/70 mb-2">
              音轨数量（10 轨起步）
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={STEMS_BASE_TRACKS}
                max={64}
                value={tracks}
                onChange={(e) => setTracks(Number(e.target.value))}
                className="w-full accent-violet-400"
              />
              <input
                type="number"
                min={STEMS_BASE_TRACKS}
                max={64}
                value={tracks}
                onChange={(e) =>
                  setTracks(
                    Math.min(
                      64,
                      Math.max(STEMS_BASE_TRACKS, Number(e.target.value) || STEMS_BASE_TRACKS),
                    )
                  )
                }
                className="w-20 rounded-md bg-white/10 border border-white/10 px-2 py-1 text-sm text-white"
              />
              <span className="text-sm text-white/50">轨</span>
            </div>
            <p className="mt-2 text-xs text-white/50">
              计价：{STEMS_BASE_TRACKS} 轨内 {cn(STEMS_BASE_PRICE)}；超过部分每轨 +{cn(STEMS_EXTRA_PER)}
            </p>
          </div>

          {/* 汇总卡 */}
          <div className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 backdrop-blur">
            <div className="text-xs text-white/60">预计价格</div>
            <div className="text-2xl font-semibold text-white mt-1">{cn(price)}</div>
            <a
              href="#contact"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/20 px-3 py-1.5 text-sm text-white transition"
            >
              联系下单
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="block text-sm text-white/70 mb-2">
              编曲档位（暂定）
            </label>
            <div className="grid gap-2">
              {ARR_TIERS.map((t) => (
                <label
                  key={t.key}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 cursor-pointer hover:bg-white/[0.08]"
                >
                  <input
                    type="radio"
                    name="arr-tier"
                    className="accent-violet-400"
                    checked={tier === t.key}
                    onChange={() => setTier(t.key)}
                  />
                  <span className="text-sm text-white/90">{t.label}</span>
                  <span className="ml-auto text-sm text-white/80">{cn(t.price)}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/50">
              可根据风格、参考与素材丰富度调整；乐器录制等额外成本另计。
            </p>
          </div>

          {/* 汇总卡 */}
          <div className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 backdrop-blur">
            <div className="text-xs text-white/60">预计价格</div>
            <div className="text-2xl font-semibold text-white mt-1">{cn(price)}</div>
            <a
              href="#contact"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/20 px-3 py-1.5 text-sm text-white transition"
            >
              咨询编曲
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingEstimator;