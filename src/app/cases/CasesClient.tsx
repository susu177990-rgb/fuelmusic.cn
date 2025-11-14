"use client";
import React, { useMemo, useState } from "react";
import CaseCard from "../../components/CaseCard";
import { CASES } from "../lib/site-data";

/** 客户端组件：搜索/筛选/分组渲染 */
export default function CasesClient() {
  const [q, setQ] = useState("");
  const [year, setYear] = useState<"all" | "none" | number>("all");

  const years = useMemo(() => {
    const ys = Array.from(new Set(CASES.map(c => c.year).filter(Boolean))) as number[];
    ys.sort((a, b) => b - a);
    const hasNone = CASES.some(c => !c.year);
    return { list: ys, hasNone };
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return CASES.filter(c => {
      const hitYear = 
        year === "all" ? true : 
        year === "none" ? !c.year : 
        c.year === year;

      const hay = `${c.artist} ${c.title} ${c.description ?? ""} ${c.role ?? ""}`.toLowerCase();
      const hitKw = kw === "" ? true : hay.includes(kw);
      return hitYear && hitKw;
    });
  }, [q, year]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const c of filtered) {
      const key = c.year ? String(c.year) : "未标注";
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    // 排序：年份从大到小，最后是“未标注”
    const keys = Array.from(map.keys());
    keys.sort((a, b) => {
      const na = a === "未标注" ? -Infinity : Number(a);
      const nb = b === "未标注" ? -Infinity : Number(b);
      return (nb as number) - (na as number);
    });
    return { keys, map };
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* 控件区 */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="block md:col-span-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">搜索（艺人/作品/说明）</span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="例如：单曲 / EP / 品牌短片 / 混音 / 母带"
              className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-neutral-900/70 border-black/10 dark:border-white/10"
            />
          </label>

          <div className="block">
            <div className="text-sm text-gray-600 dark:text-gray-300">年份</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <button onClick={() => setYear("all")}
                className={`px-3 py-1.5 rounded-xl border ${year==="all" ? "bg-[var(--brand)] text-white border-transparent" : "bg-white/70 dark:bg-neutral-900/70 border-black/10 dark:border-white/10"}`}>
                全部
              </button>
              {years.list.map(y => (
                <button key={y} onClick={() => setYear(y)}
                  className={`px-3 py-1.5 rounded-xl border ${year===y ? "bg-[var(--brand)] text-white border-transparent" : "bg-white/70 dark:bg-neutral-900/70 border-black/10 dark:border-white/10"}`}>
                  {y}
                </button>
              ))}
              {years.hasNone && (
                <button onClick={() => setYear("none")}
                  className={`px-3 py-1.5 rounded-xl border ${year==="none" ? "bg-[var(--brand)] text-white border-transparent" : "bg-white/70 dark:bg-neutral-900/70 border-black/10 dark:border-white/10"}`}>
                  未标注
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 分组渲染 */}
      {groups.keys.length === 0 ? (
        <div className="section-sub">没有匹配的案例。</div>
      ) : (
        groups.keys.map(k => (
          <section key={k} className="space-y-3">
            <h2 className="section-title">{k}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {(groups.map.get(k) ?? []).map(c => (
                <CaseCard key={c.slug} item={c} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}