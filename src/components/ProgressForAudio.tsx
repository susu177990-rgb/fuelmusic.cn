// src/components/ProgressForAudio.tsx 
"use client"; 

 import { useEffect, useRef, useState } from "react"; 
 import { useScrubber } from "../lib/useScrubber"; 

export default function ProgressForAudio({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const { scrubbing, scrubPct, onPointerDown } = useScrubber({
    containerRef: barRef,
    duration,
    onCommit: (t) => {
      const a = audioRef.current;
      if (!a || !Number.isFinite(t)) return;
      a.currentTime = Math.max(0, Math.min(t, a.duration || t));
      setCurrent(a.currentTime);
    },
  });

  // 同步 UI 与 <audio>（播放时用 rAF 更顺滑）
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    let raf: number | null = null;
    const update = () => {
      if (!scrubbing) {
        setCurrent(a.currentTime || 0);
        setDuration(a.duration || 0);
      }
      if (!a.paused) raf = requestAnimationFrame(update);
    };
    const onPlay = () => {
      if (raf != null) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    const onPause = () => {
      if (raf != null) cancelAnimationFrame(raf);
      raf = null;
      update();
    };

    a.addEventListener("loadedmetadata", update);
    a.addEventListener("durationchange", update);
    a.addEventListener("timeupdate", update);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    update();

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      a.removeEventListener("loadedmetadata", update);
      a.removeEventListener("durationchange", update);
      a.removeEventListener("timeupdate", update);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [audioRef, scrubbing]);

  const pct = (() => {
    if (scrubbing) return scrubPct || 0;
    if (!duration) return 0;
    let p = current / duration;
    if (!Number.isFinite(p)) p = 0;
    return Math.max(0, Math.min(1, p));
  })();

  return (
    <div
      ref={barRef}
      className="relative h-3 w-full rounded-full bg-zinc-800/70"
      data-progress
      onPointerDown={onPointerDown}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-white/70"
        style={{ width: `${pct * 100}%` }}
        data-progress-fill
      />
      <div
        className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow"
        style={{ left: `${pct * 100}%`, transform: "translate(-50%, -50%)" }}
        data-progress-thumb
      />
    </div>
  );
}
