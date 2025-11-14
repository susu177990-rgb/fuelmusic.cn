// src/lib/useScrubber.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UseScrubberOptions = {
  /** 进度条容器的 ref（用于算宽度与坐标） */
  containerRef: React.RefObject<HTMLElement>;
  /** 媒体时长（秒） */
  duration: number;
  /** 松手后把时间（秒）提交给外部（例如设置 audio.currentTime） */
  onCommit: (timeSec: number) => void;
};

export function useScrubber({ containerRef, duration, onCommit }: UseScrubberOptions) {
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubPct, setScrubPct] = useState(0); // 0~1
  const rafId = useRef<number | null>(null);
  const pendingPct = useRef<number | null>(null);

  const pctFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width || 1);
    return (rect.width ? x / rect.width : 0);
  }, [containerRef]);

  const schedulePct = useCallback((pct: number) => {
    pendingPct.current = pct;
    if (rafId.current == null) {
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        if (pendingPct.current != null) {
          setScrubPct(pendingPct.current);
          pendingPct.current = null;
        }
      });
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    setScrubbing(true);
    schedulePct(pctFromClientX(e.clientX));
  }, [pctFromClientX, schedulePct]);

  useEffect(() => {
    if (!scrubbing) return;
    const onMove = (e: PointerEvent) => schedulePct(pctFromClientX(e.clientX));
    const onUp = (e: PointerEvent) => {
      (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      const pct = pctFromClientX(e.clientX);
      schedulePct(pct);
      setScrubbing(false);
      const t = (Number.isFinite(duration) && duration > 0) ? pct * duration : 0;
      onCommit(t);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [scrubbing, pctFromClientX, schedulePct, duration, onCommit]);

  return { scrubbing, scrubPct, onPointerDown };
}